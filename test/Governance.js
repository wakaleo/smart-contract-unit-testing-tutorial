const {expect} = require("chai");

describe("Governance Proposal Contract", function () {
    let governance, addr1;

    beforeEach(async () => {
        [addr1] = await ethers.provider.listAccounts();
        [voter1, voter2, voter3, voter4, voter5] = await ethers.getSigners();
        const Governance = await ethers.getContractFactory("Governance");
        governance = await Governance.deploy();
        await governance.deployed();

        await governance.propose("Go out to lunch", 3)

    });

    it("The governance contract is administrated by the creator", async function () {
        expect(await governance.admin()).to.equal(addr1);
    });

    describe("When creating a proposal", () => {
        // Testing the returned object
        it("should have created the proposal", async () => {
            const proposal = await governance.proposals(1);
            expect(proposal.id).to.equal(1)
            expect(proposal.description).to.equal("Go out to lunch")
            expect(proposal.quorumVotes).to.equal(3)
        });

        // Testing that an event has been emitted
        it("should emit an event when a proposal is created", async () => {
            expect(await governance.propose("Go out to lunch again", 5))
                .to.emit(governance, 'ProposalCreated')
        });
    });

    describe("When voting on a proposal", () => {
        // Check for an event contents
        it("should emit a VoteCast event when someone votes", async () => {
            expect(await governance.castVote(1, true))
                .to.emit(governance, 'VoteCast')
                .withArgs(addr1, 1, true, true)
        });
        it("should emit a VoteTally event when someone votes", async () => {
            expect(await governance.castVote(1, true))
                .to.emit(governance, 'VoteTally')
                .withArgs(1, 1, 0)
        });
        // Check for a rolled-back operation
        it("should not be possible to vote twice", async () => {
            await governance.castVote(1, true);
            await expect(governance.castVote(1, true))
                .to.be.revertedWith('Already voted');
        });
        // Use a different account
        it("Each voter can vote once", async () => {
            expect(await governance.connect(voter1).castVote(1, true))
                .to.emit(governance, 'VoteTally')
                .withArgs(2, 0, 0)
        });
        it("Voters can vote both Yes and No", async () => {
            await governance.connect(voter1).castVote(1, true)
            await governance.connect(voter2).castVote(1, true)
            expect(await governance.connect(voter3).castVote(1, false))
                .to.emit(governance, 'VoteTally')
                .withArgs(2, 1, 0)
        });

        describe("When closing a proposal", () => {

            it("A proposal can be closed once enough people have voted", async () => {
                await governance.connect(voter1).castVote(1, true)
                await governance.connect(voter2).castVote(1, true)
                await governance.connect(voter3).castVote(1, true)
                await governance.connect(voter4).castVote(1, false)

                await expect(governance.closeBallot(1))
                    .to.emit(governance, 'VoteFinished')
                    .withArgs(1, 3, 1, true);
            });

            it("A proposal can be closed if not enough people have voted", async () => {
                await governance.connect(voter1).castVote(1, true)
                await governance.connect(voter2).castVote(1, true)

                await expect(governance.closeBallot(1))
                    .to.be.reverted
            });

            it("No one can vote once a proposal is concluded", async () => {
                await governance.connect(voter1).castVote(1, true)
                await governance.connect(voter2).castVote(1, true)
                await governance.connect(voter3).castVote(1, true)
                await governance.connect(voter4).castVote(1, false)
                await expect(governance.closeBallot(1))

                await expect(governance.connect(voter5).castVote(1, true))
                    .to.be.revertedWith('Vote closed');
            });
        });
    });


    describe("When cancelling a proposal", () => {

        it("A proposal can be cancelled at any time", async () => {
            await expect(governance.cancelBallot(1))
                .to.emit(governance, 'VoteCancelled')
                .withArgs(1);
        });
        it("Only the creator can cancel the proposal", async () => {
            await expect(governance.connect(voter2).cancelBallot(1)).to.be.reverted
        });
        it("No one can vote once a proposal is cancelled", async () => {
            await expect(governance.cancelBallot(1))

            await expect(governance.connect(voter5).castVote(1, true))
                .to.be.revertedWith('Vote closed');
        });

    });
});
