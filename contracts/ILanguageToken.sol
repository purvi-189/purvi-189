// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILanguageToken is IERC20{

 function getCurrentVotes(address account) external view returns (uint96);

    function getPriorVotes(
        address account,
        uint256 blockNumber
    ) external view returns (uint96);

    function delegate(address to) external payable;

    function delegateTransfer(address from, address to) external;

    function moveDelegates(
        address srcRep,
        address destRep,
        uint96 amt
    ) external;

    function writeCheckpoint(
        address delegatee,
        uint32 nCheckpoints,
        uint96 oldVotes,
        uint96 newVotes
    ) external;

    function setTokenprice(uint _tokenPrice) external;

    function getTokenPrice() external view returns (uint256);

    // function getAllProposals() external view returns (Proposal[] memory);

    // function getAllTemplates() external view returns (Proposal[] memory);


}
