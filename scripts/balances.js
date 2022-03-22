const tokenAddr = "0x117130ab0ECaDd4419fF9adDF355173F5cF7014c";
const totalSupply = 10_000_000;
const addrs = [
    "0xb56ddC323Dce09aF5006B060573bE8A1084a0f78", // Voter 1
    "0x97bBdDD97a5EA27Ca7EF886603691500ff76a3a2", // Voter 2
    "0x355c6EcB2E98d934a9B222061a91Ae78068217D7", // Voter 3
    "0xEeaa5E380203739dEbF457186eaaC525bB32c2E4", // Voter 4
    "0xF4d86e7724B3a007Fc14f758D0DD5Db77D2aa21E", // Voter 5
]

async function main() {
    const token = await ethers.getContractAt("Voken", tokenAddr);
    // sharing 50% of the voting power with these addreses
    const share = 100;// Math.floor((totalSupply - 5_000_000) / addrs.length);

    for (let i = 0; i < addrs.length; i++) {
        let balance = await token.balanceOf(addrs[i]);
        console.log("Balance of " + addrs[i] + ": " + balance);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
