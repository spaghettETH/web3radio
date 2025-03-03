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
    const userWallet = new ethers.Wallet(keys[1]).connect(provider)
    console.log("User wallet is: " + userWallet.address)
    const signature = await userWallet.signMessage("Add song: " + songUri)
    console.log("Signature is: " + signature)
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
