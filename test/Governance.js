const {expect} = require("chai");

describe("Governance Proposal Contract", function () {
    let governance, addr1;

    beforeEach(async () => {
        [addr1] = await ethers.provider.listAccounts();
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
        it("should emit an event when someone votes", async () => {
            expect(await governance.castVote(1,true))
                .to.emit(governance, 'VoteCast')
                .withArgs(addr1, 1, true, true)
        });
        // Check for a rolled-back operation
        it("should not be possible to vote twice", async () => {
            await governance.castVote(1, true);
            await expect(governance.castVote(1,true))
                .to.be.revertedWith('Already voted');
        });
    });
});
