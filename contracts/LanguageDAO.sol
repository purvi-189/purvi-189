//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ITemplateNFT.sol";
import "./ILanguageToken.sol";
import "./ITimelock.sol";
import "hardhat/console.sol";

contract LanguageDAO {
    string public constant name = "langDAO";

    function quorumVotes() public pure returns (uint256) {
        return 40;
    }

    function proposalMaxOperations() public pure returns (uint256) {
        return 10;
    }

    function proposalThreshold() public pure returns (uint256) {
        return 10;
    } // 1% of 1000

    function votingDelay() public pure returns (uint256) {
        return 1;
    } //1 block

    function votingPeriod() public pure returns (uint256) {
        return 40;
    } // 10 min ==> 40 blocks

    ITimelock public timelock;
    ILanguageToken public langtoken;
    ITemplateNFT public templateNFT;
    uint256 public proposalCount;
    address public guardian;

    struct Proposal {
        uint256 id;
        address creator;
        uint256 eta;
        uint256 startBlock;
        uint256 endBlock;
        address[] targets; // list of add for calls to be made
        uint256[] values;
        string[] signatures;
        bytes[] calldatas;
        bool cancel;
        bool executed;
        // bool isScrape;
    }
    struct ProposalBasicData {
        uint256 id;
        address creator;
        string title;
        string description;
        string proposalFile;
        uint256 templateId;
        uint256 forVotes;
        uint256 againstVotes;
    }

    struct Receipt {
        bool hasVoted;
        bool support;
        uint96 votes;
    }
    mapping(uint256 => mapping(address => Receipt)) public proposalReceipts;

    // states proposal may be in
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => ProposalBasicData) public proposalsBasicData;

    mapping(address => uint256) public latestProposalIds;
    mapping(address => uint256) public memberWithdrawAmount;

    mapping(address => bool) public receivedMemberNFT;
    mapping(address => uint256) public memberVotes;
    mapping(address => uint256) public memberProposals;

    // Add a mapping to store the templateId for each proposal
    mapping(uint256 => uint256) public proposalToTemplateId;


    event ProposalCreated(
        uint256 id,
        address proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 startBlock,
        uint256 endBlock
    );
    event VoteCast(
        address voter,
        uint256 proposalId,
        bool support,
        uint256 votes
    );
    event ProposalCanceled(uint256 id);
    event ProposalQueued(uint256 id, uint256 eta);
    event ProposalExecuted(uint256 id);

    address[] allDaoMemberAddress;
    mapping(address => bool) public isMemberAdded;

    uint96 public royaltyFee = 10000000000000000000; // 10 eth
    uint256 public proposalStake = 5000000000000000000; //5 ETH

    constructor(
        address timelock_,
        address token_,
        address template_,
        string memory _nftUri
    ) {
        timelock = ITimelock(timelock_);
        langtoken = ILanguageToken(token_);
        templateNFT = ITemplateNFT(template_);
        guardian = msg.sender;
        templateNFT.mintcreatorNFT(msg.sender, _nftUri);
    }

    function addMember(uint96 _tokens) public payable {
        require(
            msg.value == (_tokens * langtoken.getTokenPrice()),
            "Not enough value"
        );
        require(
            langtoken.balanceOf(address(this)) >= _tokens,
            "Contract does not have enough tokens"
        );
        if (!isMemberAdded[msg.sender]) {
            allDaoMemberAddress.push(msg.sender);
            isMemberAdded[msg.sender] = true;
        }
        langtoken.transfer(msg.sender, _tokens);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory proposalFile,
        uint _templateId
        // bool _isScrape,

        
    ) public payable returns (uint) {
        // member must have joined the samhita dao
        require(
            msg.value == (proposalStake + royaltyFee),
            "You must have valid stake amount to create a proposal"
        );
        require(
            langtoken.getPriorVotes(msg.sender, sub256(block.number, 1)) >
                proposalThreshold(),
            "proposer votes below proposal threshold"
        );
        require(
            targets.length == values.length &&
                targets.length == signatures.length &&
                targets.length == calldatas.length,
            "proposal function information arity mismatch"
        );
        require(targets.length != 0, "some action must be there");
        require(targets.length <= proposalMaxOperations(), "too many actions");

        // retrives latest proposalid submitted by msg.sender
        uint256 latestProposalId = latestProposalIds[msg.sender];
        if (latestProposalId != 0) {
            //means proposer has submitted the proposal before
            ProposalState latestProposalState = state(latestProposalId); /// state based on ID
            require(
                latestProposalState != ProposalState.Active,
                "Found an already active proposal"
            );
            require(
                latestProposalState != ProposalState.Pending,
                "Found an already pending proposal"
            );
        }
        uint256 startBlock = add256(block.number, votingDelay()); //  represents the number of blocks that must pass after the proposal is submitted before the voting can start.
        uint256 endBlock = add256(startBlock, votingPeriod()); // time for which voting will be open

        // increasing count of proposal of a particular user
        proposalCount++;
        proposals[proposalCount] = Proposal(
            proposalCount,
            msg.sender,
            0,
            startBlock,
            endBlock,
            targets,
            values,
            signatures,
            calldatas,
            false,
            false
        );

        proposalsBasicData[proposalCount] = ProposalBasicData(
            proposalCount,
            msg.sender,
            title,
            description,
            proposalFile,
            _templateId,
            0,
            0
        );
        latestProposalIds[msg.sender] = proposalCount;
        memberProposals[msg.sender] += 1;

          // Calculate templateID
    uint256 templateID = proposalsBasicData[proposalCount].templateId;

    // Store the templateId for the proposal
    proposalToTemplateId[proposalCount] = templateID;
    
        ////
        emit ProposalCreated(
            proposalCount,
            msg.sender,
            targets,
            values,
            signatures,
            calldatas,
            startBlock,
            endBlock
        );
        return proposalCount;
    //   return(proposalCount, _templateID); 

    }

    function queue(uint256 proposalId, uint256 templateId) public {
        require(
            state(proposalId) == ProposalState.Succeeded,
            "proposal can only be queued if it is succeeded"
        );
        memberWithdrawAmount[proposals[proposalId].creator] += proposalStake;

        // fetches data assciated with proposal
        Proposal storage proposal = proposals[proposalId];
        // timestamp at which prop is executed
        uint256 eta = add256(block.timestamp, timelock.delay()); // 600
        // loop for all actions in proposal
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            _queueOrRevert(
                proposal.targets[i],
                proposal.values[i],
                proposal.signatures[i],
                proposal.calldatas[i],
                eta
            );
        }
        //record timestamp at which prop can be executed
        proposal.eta = eta;

        //  royalty to template creator
        if (proposalsBasicData[proposalId].templateId > 0) {
            console.log(proposalsBasicData[proposalId].templateId );

            address tempCreator = templateNFT.getTemplateDetails(templateId);
            // console.log(tempCreator);
            langtoken.transfer(tempCreator, royaltyFee);
        }
        emit ProposalQueued(proposalId, eta);
    }

    function _queueOrRevert(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) internal {
        //encoding the data and then computing hash  this requ checks prop actions is already queued or not
        require(
            !timelock.queuedTransactions(
                keccak256(abi.encode(target, value, signature, data, eta))
            ),
            " proposal action already queued at eta"
        );
        timelock.SetTempSender(msg.sender);
        timelock.queueTransaction(target, value, signature, data, eta);
    }

    function execute(uint256 proposalId) public payable {
        require(
            state(proposalId) == ProposalState.Queued,
            "proposal can only be executed if it is queued"
        );
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;

        for (uint256 i = 0; i < proposal.targets.length; i++) {
            timelock.executeTransaction{value: proposal.values[i]}(
                proposal.targets[i],
                proposal.values[i],
                proposal.signatures[i],
                proposal.calldatas[i],
                proposal.eta
            );
        }
        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) public {
        require(
            state(proposalId) != ProposalState.Executed,
            "cannot cancel executed proposal"
        );
        Proposal storage proposal = proposals[proposalId];
        // prop can't be canceled if gained enough votes
        require(
            msg.sender == guardian ||
                langtoken.getPriorVotes(
                    proposal.creator,
                    sub256(block.number, 1)
                ) <
                proposalThreshold(),
            "proposer above threshold"
        );
        proposal.cancel = true;
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            timelock.cancelTransaction(
                proposal.targets[i],
                proposal.values[i],
                proposal.signatures[i],
                proposal.calldatas[i],
                proposal.eta
            );
        }
        emit ProposalCanceled(proposalId);
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        require(
            proposalCount >= proposalId && proposalId > 0,
            " invalid proposal id"
        );
        Proposal storage proposal = proposals[proposalId];
        if (proposal.cancel) {
            return ProposalState.Canceled;
        } else if (block.number <= proposal.startBlock) {
            return ProposalState.Pending;
        } else if (block.number <= proposal.endBlock) {
            return ProposalState.Active;
        } else if (
            proposalsBasicData[proposalId].forVotes <=
            proposalsBasicData[proposalId].againstVotes ||
            proposalsBasicData[proposalId].forVotes < quorumVotes()
        ) {
            return ProposalState.Defeated;
        } else if (proposal.eta == 0) {
            return ProposalState.Succeeded;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else if (
            block.timestamp >= add256(proposal.eta, timelock.GRACE_PERIOD())
        ) {
            return ProposalState.Expired;
        } else {
            return ProposalState.Queued;
        }
    }

    function castVote(uint256 proposalId, bool support) public {
        return _castVote(msg.sender, proposalId, support);
    }

    // updates the vote count and records the voter's receipt (record of vote) for the given proposal
    function _castVote(
        address voter,
        uint256 proposalId,
        bool support
    ) internal {
        require(state(proposalId) == ProposalState.Active, "voting is closed");
        Proposal storage proposal = proposals[proposalId];

        // receipt of the voter for given prop
        Receipt storage receipt = proposalReceipts[proposalId][voter];

        require(receipt.hasVoted == false, "voter has already voted");
        uint96 votes = langtoken.getPriorVotes(voter, proposal.startBlock);

        if (support) {
            proposalsBasicData[proposalId].forVotes = add256(
                proposalsBasicData[proposalId].forVotes,
                votes
            );
        } else {
            proposalsBasicData[proposalId].againstVotes = add256(
                proposalsBasicData[proposalId].againstVotes,
                votes
            );
        }
        receipt.hasVoted = true;
        receipt.support = support;
        receipt.votes = votes;
        memberVotes[msg.sender] += 1;
        emit VoteCast(voter, proposalId, support, votes);
    }

    function setRoyalty(uint96 _price) public {
        royaltyFee = _price;
    }

    function __abdicate() public {
        require(msg.sender == guardian, "sender must be gov guardian");
        guardian = address(0);
    }

    function __acceptAdmin() public {
        require(msg.sender == guardian, "sender must be gov guardian");
        timelock.acceptAdmin();
    }

    function add256(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "addition overflow");
        return c;
    }

    function sub256(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "subtraction underflow");
        return a - b;
    }

    function claimMemberNft(string memory _nftUri) public {
        if (receivedMemberNFT[msg.sender] == false) {
            if (
                memberProposals[msg.sender] >= 2 && memberVotes[msg.sender] >= 5
            ) {
                {
                    templateNFT.mintMemberNFT(msg.sender, _nftUri);
                    receivedMemberNFT[msg.sender] = true;
                }
            }
        }
    }

    // Add a function to get the templateId for a specific proposal
    function getTemplateId(uint256 proposalId) public view returns (uint256) {
    return proposalToTemplateId[proposalId];
}

}
