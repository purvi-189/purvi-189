// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISamhitaToken is IERC20 {
    struct Proposal {
        uint256 id;
        address creator;
        uint256 eta;
        address[] targets; // list of add for calls to be made
        uint256[] values;
        string[] signatures;
        bytes[] calldatas;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool cancel;
        bool executed;
        bool isScrape; // true ==> scrape else its datacraft
        string category; // template , governance, finance
        string proposalFile;
        // mapping(address => Receipt) receipts;
    }

    struct Receipt {
        bool hasVoted;
        bool support;
        uint96 votes;
    }

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

    function getAllProposals() external view returns (Proposal[] memory);

    function getAllTemplates() external view returns (Proposal[] memory);
}
