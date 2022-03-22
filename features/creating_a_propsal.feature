Feature: Creating a proposal

  Anyone can create a proposal.
  The proposal is sent to a a list of participants who need to
  register their interest if they want to review it

  Scenario Outline : Pete proposes a new proposal
    Given Pete has made the following proposal to his 4 friends:
      | Proposal                                   |
      | Go to the Mexican restaurant down the road |
    And they all have registered their interest
    When the proposition receives <Votes for> votes for and <Votes against> votes against
    Then the proposal should be <Confirmed or Rejected>
    Examples:
      | Votes for | Votes against | Confirmed or Rejected |
      | 2         | 2             | Confirmed             |
      | 1         | 3             | Rejected              |
