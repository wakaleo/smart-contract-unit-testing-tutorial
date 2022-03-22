//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Governance {

    /// @notice The name of this contract
    string public constant name = "Governance Contract";

    address public admin;

    /// @notice The total number of proposals
    uint public proposalCount;

    enum ProposalState {
        Active,
        Cancelled,
        Defeated,
        Succeeded,
        Expired,
        Executed
    }

    struct Proposal {
        // @notice Unique id for looking up a proposal
        uint id;

        // @notice Creator of the proposal
        address proposer;

        // @notice The number of votes in support of a proposal required in order for a quorum to be reached and for a vote to succeed
        uint quorumVotes;

        // @notice The text description of the proposal
        string description;

        // @notice the state of the proposal
        ProposalState state;

        // @notice Current number of votes in favor of this proposal
        uint votesFor;

        // @notice Current number of votes in opposition to this proposal
        uint votesAgainst;

    }

    // @notice Receipts of ballots for the entire set of voters
    mapping(uint => mapping(address => Receipt)) receipts;

    //
    struct VoteCount {
        uint proposalId;
        string description;
        uint votesFor;
        uint votesAgainst;
    }


    /// @notice Ballot receipt record for a voter
    struct Receipt {
        // @notice Whether or not a vote has been cast
        bool hasVoted;

        // @notice Whether or not the voter supports the proposal
        bool yesNo;
    }

    /// @notice The official record of all proposals ever proposed
    mapping(uint => Proposal) public proposals;

    /// @notice An event emitted when a new proposal is created
    event ProposalCreated(uint id, address proposer, string description);

    /// @notice An event emitted when a vote has been cast on a proposal
    event VoteCast(address voter, uint proposalId, bool yesNo, bool hasVoted);
    event VoteTally(uint proposalId, uint votesFor, uint votesAgainst);
    event VoteFinished(uint proposalId, uint votesFor, uint votesAgainst, bool succeeded);
    event VoteCancelled(uint proposalId);

    constructor()  {
        admin = msg.sender;
    }

    function propose(string memory description, uint quorum) public returns (uint) {
        proposalCount++;
        Proposal memory newProposal = Proposal({
        id : proposalCount,
        proposer : msg.sender,
        quorumVotes : quorum,
        description : description,
        state : ProposalState.Active,
        votesFor : 0,
        votesAgainst : 0
        });
        proposals[newProposal.id] = newProposal;

        emit ProposalCreated(newProposal.id, newProposal.proposer, newProposal.description);

        return newProposal.id;
    }

    function castVote(uint proposalId, bool yesNo) public {
        castVote(msg.sender, proposalId, yesNo);
    }

    function castVote(address voter, uint proposalId, bool yesNo) internal {

        require(!receipts[proposalId][voter].hasVoted, "Already voted");
        Proposal storage currentProposal = proposals[proposalId];
        require(currentProposal.state == ProposalState.Active, 'Vote closed');

        Receipt storage receipt = receipts[proposalId][voter];

        receipt.yesNo = yesNo;
        receipt.hasVoted = true;

        if (yesNo) {
            currentProposal.votesFor++;
        } else {
            currentProposal.votesAgainst++;
        }
        emit VoteCast(voter, currentProposal.id, yesNo, true);
        emit VoteTally(currentProposal.id, currentProposal.votesFor, currentProposal.votesAgainst);
    }

    function votesFor(uint proposalId) public returns (uint) {
        return proposals[proposalId].votesFor;
    }

    function votesAgainst(uint proposalId) public returns (uint) {
        return proposals[proposalId].votesAgainst;
    }

    function closeBallot(uint proposalId) public {
        Proposal storage currentProposal = proposals[proposalId];

        require(currentProposal.votesAgainst + currentProposal.votesFor >= currentProposal.quorumVotes, "Quorum not achieved");

        bool result;
        if (currentProposal.votesFor > currentProposal.votesAgainst) {
            currentProposal.state = ProposalState.Succeeded;
            result = true;
        } else {
            currentProposal.state = ProposalState.Defeated;
            result = false;
        }

        emit VoteFinished(currentProposal.id, currentProposal.votesFor, currentProposal.votesAgainst, result);
    }

    function cancelBallot(uint proposalId) public {
        Proposal storage currentProposal = proposals[proposalId];
        require(msg.sender == currentProposal.proposer);

        currentProposal.state = ProposalState.Cancelled;

        emit VoteCancelled(currentProposal.id);
    }

}
