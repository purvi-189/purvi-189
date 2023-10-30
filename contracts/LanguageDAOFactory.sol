// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LanguageDAOFactory {
    constructor() {
        dataDaoFactoryOwner = msg.sender;
    }

    // factory contract owner
    address public immutable dataDaoFactoryOwner;

    // number of DataDAO created
    uint256 public numOfDataDao;

    // struct to store all the data of dataDao and dataDaoFactory contract
    struct dataDaoFactoryStruct {
        address dataDaoOwner;
        string dataDaoName;
        string dataDaoDescription;
        address dataDaoAddress;
        address dataDAOTokenAddress;
        uint totalSupplly;
        uint tokenPrice;
    }
    address[] public allDataDaosAddress;

    mapping(address => dataDaoFactoryStruct) public allDataDaos;

    mapping(uint256 => address) public searchByDaoId;

    mapping(address => address[]) public userDataDAO;

    function createDataDao(
        address _dataDAOAddress,
        string memory _name,
        string memory _description,
        IERC20 _token,
        uint _tokenPrice,
        uint _totalSupply
    ) public {
        // DataDAO dataDao = new DataDAOInstance(
        //     msg.sender, _token, _condition, _minimunApproval, _votingPeriod, _tokenPrice
        // );
        userDataDAO[msg.sender].push(_dataDAOAddress);
        allDataDaosAddress.push(_dataDAOAddress);

        // Add the new DataDAO to the mapping
        allDataDaos[_dataDAOAddress] = (
            dataDaoFactoryStruct(
                msg.sender, // address of dataDAO owner
                _name,
                _description,
                _dataDAOAddress,
                address(_token),
                _tokenPrice,
                _totalSupply
            )
        );
        searchByDaoId[numOfDataDao] = _dataDAOAddress;
        numOfDataDao++;
    }

    function getAllDataDaos()
        public
        view
        returns (dataDaoFactoryStruct[] memory)
    {
        dataDaoFactoryStruct[] memory DataDaos = new dataDaoFactoryStruct[](
            allDataDaosAddress.length
        );

        for (uint i = 0; i < allDataDaosAddress.length; i++) {
            DataDaos[i] = (allDataDaos[allDataDaosAddress[i]]);
        }
        return DataDaos;
    }

    function getUserDataDaos(
        address _userAddress
    ) public view returns (dataDaoFactoryStruct[] memory) {
        dataDaoFactoryStruct[] memory DataDaos = new dataDaoFactoryStruct[](
            userDataDAO[_userAddress].length
        );
        for (uint i = 0; i < userDataDAO[_userAddress].length; i++) {
            DataDaos[i] = (allDataDaos[userDataDAO[_userAddress][i]]);
        }
        return DataDaos;
    }

    function getDataDaoInstance(
        uint256 id
    ) public view returns (dataDaoFactoryStruct memory) {
        return allDataDaos[searchByDaoId[id]];
    }

    // function to withdraw the fund from contract factory
    // function withdraw(uint256 amount) external payable {
    //     require(
    //         msg.sender == dataDaoFactoryOwner,
    //         "ONLY_ONWER_CAN_CALL_FUNCTION"
    //     );
    //     // sending money to contract owner
    //     require(address(this).balance >= amount, "not_enough_funds");
    //     (bool success, ) = dataDaoFactoryOwner.call{value: amount}("");
    //     require(success, "TRANSFER_FAILED");
    // }
}
