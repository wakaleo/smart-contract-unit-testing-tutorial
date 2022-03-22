const { expect } = require("chai");

describe("ERC20 Voting Token", function () {

    let proposal, maker, voter1, voter2;

    beforeEach(async() => {
        [maker, voter1, voter2] = await ethers.provider.listAccounts();
        const Voken = await ethers.getContractFactory("Voken");
        voken = await Voken.deploy();
        await voken.deployed();
    });

    // Voting tokens are used to manage voting access
    it("should be initially created with the total supply assigned to the creating address", async function() {
        const balance = await voken.balanceOf(maker);
        expect(balance.toString()).to.equal(ethers.utils.parseEther("10000000").toString());
    });

});

