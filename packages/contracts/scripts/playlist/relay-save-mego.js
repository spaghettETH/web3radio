const { ethers } = require("ethers");
const { derive } = require('../_address')
const fs = require('fs');
const axios = require('axios');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('../contracts/artifacts/contracts/DecentraPlaylist.sol/DecentraPlaylist.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_addresses.Playlist, ABI.abi, wallet)
    const { keys } = await derive(configs.owner_mnemonic, 2)
    const songId = 1
    const signature = "0xaeb5a860612c0b53512b695b0b6bb65673437ae08ac57a9ae847bcd605f7c0ae4529e2ca39d68f9935d3917299023039bf205db632f703f7438e0fc4a9d41a921c"
    const userWallet = { address: "0xCc45DE953F0220a540600Cf7f6326542775755dA" }
    try {
        const result = await axios.post("http://localhost:3001/relay", {
            functionName: "addToMySaves",
            contract: 'playlist',
            address: userWallet.address,
            signature,
            message: "Add to my saves: " + songId,
            args: [
                songId,
                signature
            ]
        })
        console.log("Added song at:", result)
    } catch (e) {
        console.log("FAILED")
        console.log(e)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
