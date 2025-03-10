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
    const songUri = "https://dl.dropboxusercontent.com/scl/fi/9ueq1crv2t19dm25s61m9/stubb_music_1-5.mp3?rlkey=du16is24p0392pgxn9id0m6jq&st=ojufntz4&dl=0"
    // Convert message to base64
    const base64 = Buffer.from("Add song: " + songUri).toString('base64')
    console.log("Base64 is: " + base64)
    const userWallet = { address: '0xCc45DE953F0220a540600Cf7f6326542775755dA' }
    console.log("User wallet is: " + userWallet.address)
    const signature = '0x20209385a3c26f09b34e2dce6dd3298ff75937e5eab67a9e192d49bb1b2015881325cc49566ae2b6d9aa35fbaa55940afcd724dca203c4c5f9cf14154811e5731c'
    console.log("Signature is: " + signature)
    const recovered = ethers.utils.verifyMessage("Add song: " + songUri, signature)
    console.log("Recovered is: " + recovered)
    if (recovered.toLowerCase() !== userWallet.address.toLowerCase()) {
        throw new Error("Recovered address does not match user wallet address")
    }
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
