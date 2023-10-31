//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "hardhat/console.sol";

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "subtraction overflow");
    }

    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "division by zero");
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

// pragma solidity ^0.5.8;
contract Timelock {
    using SafeMath for uint;

    event NewAdmin(address indexed newAdmin);
    event NewPendingAdmin(address indexed newPendingAdmin);
    event NewDelay(uint indexed newDelay);
    event CancelTransaction(
        bytes32 indexed txHash,
        address indexed target,
        uint value,
        string signature,
        bytes data,
        uint eta
    );
    event ExecuteTransaction(
        bytes32 indexed txHash,
        address indexed target,
        uint value,
        string signature,
        bytes data,
        uint eta
    );
    event QueueTransaction(
        bytes32 indexed txHash,
        address indexed target,
        uint value,
        string signature,
        bytes data,
        uint eta
    );

    uint public constant GRACE_PERIOD = 300; // 5 min
    uint public constant MINIMUM_DELAY = 600; //10 min
    uint public constant MAXIMUM_DELAY = 900; //15 min

    address public admin;
    address public pendingAdmin;
    uint public delay;

    address public temp_sender;
    address public samhitaAddress;
    address public langDAOAddress;

    mapping(bytes32 => bool) public queuedTransactions;

    constructor(uint delay_) {
        require(delay_ >= MINIMUM_DELAY, " Delay must exceed minimum delay.");
        require(
            delay_ <= MAXIMUM_DELAY,
            " Delay must not exceed maximum delay."
        );

        admin = msg.sender;
        delay = delay_;
    }

    fallback() external payable {
        // Your fallback function code here
    }

    receive() external payable {
        // Your receive function code here
    }

    function setDelay(uint delay_) public {
        require(msg.sender == address(this), "Call must come from Timelock.");
        require(delay_ >= MINIMUM_DELAY, "Delay must exceed minimum delay.");
        require(
            delay_ <= MAXIMUM_DELAY,
            "Delay must not exceed maximum delay."
        );
        delay = delay_;
        emit NewDelay(delay);
    }

    function acceptAdmin() public {
        require(
            temp_sender == pendingAdmin,
            "Call must come from pendingAdmin."
        );
        admin = temp_sender;
        pendingAdmin = address(0);

        emit NewAdmin(admin);
    }

    function setPendingAdmin(address pendingAdmin_) public {
        require(msg.sender == address(this), "Call must come from Timelock.");
        pendingAdmin = pendingAdmin_;

        emit NewPendingAdmin(pendingAdmin);
    }
    modifier onlyOwner {
    require(msg.sender == admin);
    _;
}

       function setLanguageDAOAddress(address _address) public onlyOwner  {
        require(msg.sender == admin || msg.sender == langDAOAddress, "Call must come from admin.");
        samhitaAddress = _address;
    }


    function setSamhitaAddress(address _address) public onlyOwner  {
        require(msg.sender == admin || msg.sender == samhitaAddress, "Call must come from admin.");
        samhitaAddress = _address;
    }

    function SetTempSender(address _address) public {
        require(msg.sender == admin || msg.sender == samhitaAddress ||  msg.sender == langDAOAddress , "Call must come from admin.");
        temp_sender = _address;
    }

    function queueTransaction(
        address target,
        uint value,
        string memory signature,
        bytes memory data,
        uint eta
    ) public returns (bytes32) {
        // console.log(msg.sender);  //0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        require(msg.sender == admin || msg.sender== samhitaAddress||  msg.sender == langDAOAddress, "Call must come from admin.");

        require(
            eta >= getBlockTimestamp().add(delay),
            "Estimated execution block must satisfy delay."
        );
        bytes32 txHash = keccak256(
            abi.encode(target, value, signature, data, eta)
        );
        queuedTransactions[txHash] = true;

        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }

    function cancelTransaction(
        address target,
        uint value,
        string memory signature,
        bytes memory data,
        uint eta
    ) public {
        require(msg.sender == admin || msg.sender == samhitaAddress||  msg.sender == langDAOAddress, "Call must come from admin.");

        bytes32 txHash = keccak256(
            abi.encode(target, value, signature, data, eta)
        );
        queuedTransactions[txHash] = false;
        emit CancelTransaction(txHash, target, value, signature, data, eta);
    }

    function executeTransaction(
        address target,
        uint value,
        string memory signature,
        bytes memory data,
        uint eta
    ) public payable returns (bytes memory) {
                console.log("inn timelock");

        require(msg.sender == admin || msg.sender == samhitaAddress||  msg.sender == langDAOAddress , "Call must come from admin.");
        bytes32 txHash = keccak256(
            abi.encode(target, value, signature, data, eta)
        );
        console.log("T1");

        require(queuedTransactions[txHash], "Transaction hasn't been queued.");
                console.log("T2");

        require(
            getBlockTimestamp() >= eta,
            "Transaction hasn't surpassed timelock."
        );
                console.log("T3");

        require(
            getBlockTimestamp() <= eta.add(GRACE_PERIOD),
            "Transaction is stale."
        );
            console.log("T4");
        queuedTransactions[txHash] = false;
        bytes memory callData;
        console.log("in timelock");

        if(bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(
                bytes4(keccak256(bytes(signature))),
                data
            );
        }

        (bool success, bytes memory returnData) = target.call{value: value}(
            callData
        );

        console.log("at end of timelock");
        require(success, "transaction execution reverted.");
        emit ExecuteTransaction(txHash, target, value, signature, data, eta);
        return returnData;
    }

    function getBlockTimestamp() public view returns (uint) {
        return block.timestamp;
    }
}
