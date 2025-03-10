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
    const songUri = "https://turinglabs.mypinata.cloud/ipfs/bafybeibiofinmptxj53lxjfv34pm5y7eky5p73te6lgzwtlawn3ekwx2pm"
    const userWallet = { address: '0xCc45DE953F0220a540600Cf7f6326542775755dA' }
    console.log("User wallet is: " + userWallet.address)
    const signature = '0x5d974aa8bc74dbf99eff1a215881cc997b2686a3b84591206072f4361fc0c94c50edf3755a4c4287e863694b99fe753a8ed676ce2d516dddfa1e3791d4ffc8a41c'
    console.log("Signature is: " + signature)
    const recovered = ethers.utils.verifyMessage(songUri, signature)
    console.log("Recovered is: " + recovered)
    try {
        const result = await axios.post("https://hammerhead-app-34p34.ondigitalocean.app/relay", {
            functionName: "addSong",
            contract: 'playlist',
            address: userWallet.address,
            signature,
            message: "Add song: " + songUri,
            args: [
                songUri,
                "https://turinglabs.mypinata.cloud/ipfs/bafkreiazcwdhzvfmeiafeaknvtngm37ihjwncet6vozxel7ulcxea5lmrq",
                "GENTLESS 3 - ON BUSTING THE SOUND BARRIER",
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TAG")),
                signature
            ]
        })
        console.log("Added song at:", result)
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
