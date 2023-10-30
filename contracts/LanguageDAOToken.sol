// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LanguageDAOToken is ERC20, Ownable {
    uint public initialSupply;

    address public admin;
    uint256 tokenPrice = 100000000000000 ;
    // token balances for each account
    mapping(address => uint96) internal balances;
    mapping(address => address) public delegates;

    // record of voting power
    struct Checkpoint {
        uint32 fromBlock;
        uint96 votes;
    }
    //record of votes checkpoint for each account
    // add as key => (block no => struct )
    mapping(address => mapping(uint32 => Checkpoint)) public checkpoints;

    // no of checkpoint for each account
    mapping(address => uint32) public numCheckpoints;
    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
        );

    /// @notice The EIP-712 typehash for the delegation struct used by the contract
    bytes32 public constant DELEGATION_TYPEHASH =
        keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");
    //  amt on behalf of others
    mapping(address => mapping(address => uint96)) internal allowances;
    mapping(address => uint) public nonces;

    event DelegateChanged(
        address indexed delegator,
        address indexed fromDelegate,
        address indexed toDelegate
    );
    event DelegateVotesChanged(
        address indexed delegate,
        uint previousBalance,
        uint newBalance
    );

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint96 _initialSupplyToOwner
    ) ERC20(_tokenName, _tokenSymbol) {
        admin = msg.sender;
        initialSupply = _initialSupplyToOwner;
        _mint(msg.sender, _initialSupplyToOwner);
        balances[msg.sender] = uint96(_initialSupplyToOwner);
        // languageDAO = LanguageDAO(_languageDAOAddress);
    }

    // curent voting power with specific account
    // votes of the latest block is extracted
    function getCurrentVotes(address account) external view returns (uint96) {
        uint32 nCheckpoints = numCheckpoints[account];
        return
            nCheckpoints > 0 ? checkpoints[account][nCheckpoints - 1].votes : 0;
    }

    // allows to get voting power of blockNo.
    function getPriorVotes(
        address account,
        uint blockNumber
    ) public view returns (uint96) {
        require(
            blockNumber < block.number,
            "getPriorVotes: not yet determined"
        );

        uint32 nCheckpoints = numCheckpoints[account];
        if (nCheckpoints == 0) {
            return 0;
        }

        // First check most recent balance
        if (checkpoints[account][nCheckpoints - 1].fromBlock <= blockNumber) {
            return checkpoints[account][nCheckpoints - 1].votes;
        }

        // Next check implicit zero balance
        if (checkpoints[account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint32 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
            Checkpoint memory cp = checkpoints[account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.votes;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[account][lower].votes;
    }

    function delegate(address to) public payable {
        return delegateTransfer(msg.sender, to);
    }

    //tranfering the delegator and delegates  and moveDelegates
    function delegateTransfer(address from, address to) public {
        address curr = delegates[from]; // address of current
        uint96 fromBal = balances[from]; // balance of delegator
        delegates[from] = to; //This line updates the delegate of the from address to the specified to address. This effectively means that the voting power associated with the tokens held by the from address will now be delegated to the to address.

        emit DelegateChanged(from, curr, to);
        //. The event includes information about the previous delegate (curr) and the new delegate (to).
        moveDelegates(curr, to, fromBal);
    }

    // updating the voting power associated with two address
    // called whem change in voting power or when tokens are transfered betwn address
    function moveDelegates(address srcRep, address destRep, uint96 amt) public {
        if (srcRep != destRep && amt > 0) {
            if (srcRep != address(0)) {
                uint32 srcRepNum = numCheckpoints[srcRep]; // blocknum
                uint96 srcRepOld = srcRepNum > 0
                    ? checkpoints[srcRep][srcRepNum - 1].votes
                    : 0;

                // Ensure srcRep has enough tokens to subtract and meets the minimum balance requirement
                require(
                    srcRepOld >= amt && srcRepOld >= 10000,
                    "Insufficient voting power or balance"
                );

                uint96 srcRepNew = sub96(
                    srcRepOld,
                    amt,
                    "votes amt underflows"
                );
                writeCheckpoint(srcRep, srcRepNum, srcRepOld, srcRepNew);
            }

            if (destRep != address(0)) {
                uint32 destRepNum = numCheckpoints[destRep];
                uint96 destRepOld = destRepNum > 0
                    ? checkpoints[destRep][destRepNum - 1].votes
                    : 0;
                uint96 destRepNew = add96(
                    destRepOld,
                    amt,
                    "votes amt overflows"
                );

                writeCheckpoint(destRep, destRepNum, destRepOld, destRepNew);
            }
        }
    }

    //  when change in voting power
    function writeCheckpoint(
        address delegatee,
        uint32 nCheckpoints,
        uint96 oldVotes,
        uint96 newVotes
    ) public {
        uint32 blockNumber = safe32(
            block.number,
            "block number exceeds 32 bits"
        );

        if (
            nCheckpoints > 0 &&
            checkpoints[delegatee][nCheckpoints - 1].fromBlock == blockNumber
        ) {
            checkpoints[delegatee][nCheckpoints - 1].votes = newVotes;
        } else {
            // new voting power
            if (
                nCheckpoints > 0 &&
                checkpoints[delegatee][nCheckpoints - 1].fromBlock < blockNumber
            ) {
                // Create an intermediate checkpoint at the current block number
                checkpoints[delegatee][nCheckpoints] = Checkpoint(
                    blockNumber,
                    checkpoints[delegatee][nCheckpoints - 1].votes
                );
                nCheckpoints++;
            }
            checkpoints[delegatee][nCheckpoints] = Checkpoint(
                blockNumber,
                newVotes
            );
            numCheckpoints[delegatee] = nCheckpoints + 1;
        }
        emit DelegateVotesChanged(delegatee, oldVotes, newVotes);
    }

    function setTokenprice(uint _tokenPrice) public {
        tokenPrice = _tokenPrice;
    }

    function getTokenPrice() public view returns (uint) {
        return tokenPrice;
    }

    // used to ensure that given value is converted to 96 bit unsigned int
    // n is unsigned int
    // value of n is less than 2**96. In other words, it ensures that the value
    //  of n can be represented using 96 bits without causing an overflow.
    function safe96(
        uint n,
        string memory errMsg
    ) internal pure returns (uint96) {
        require(n < 2 ** 96, errMsg);
        return uint96(n);
    }

    function safe32(
        uint n,
        string memory errMsg
    ) internal pure returns (uint32) {
        require(n < 2 ** 32, errMsg);
        return uint32(n);
    }

    function sub96(
        uint96 x,
        uint96 y,
        string memory errMsg
    ) internal pure returns (uint96) {
        require(y <= x, errMsg);
        return x - y;
    }

    function add96(
        uint96 x,
        uint96 y,
        string memory errMsg
    ) internal pure returns (uint96) {
        uint96 z = x + y;
        require(z >= y, errMsg);
        return z;
    }

    function getChainId() internal view returns (uint) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }
}
