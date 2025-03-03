const { ethers } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./scripts/passport/abi.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.passport_minter).connect(provider)
    const contract = new ethers.Contract(configs.passport_address, ABI, wallet)

    try {
        const result = await contract.mintPassport("0x53aA8e6698195B8fFB595a1d26f04f0DEa2EEc6B")
        console.log("Minted at:", result)
    } catch (e) {
        console.log("FAILED")
        console.log(e.message)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
