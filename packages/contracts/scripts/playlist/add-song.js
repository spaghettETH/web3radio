const { ethers } = require("ethers");
const { derive } = require('../../scripts/_address')
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('../contracts/artifacts/contracts/DecentraPlaylist.sol/DecentraPlaylist.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_addresses.Playlist, ABI.abi, wallet)
    const { keys } = await derive(configs.owner_mnemonic, 2)
    const userWallet = new ethers.Wallet(keys[1]).connect(provider)
    console.log("User wallet is: " + userWallet.address)
    const signature = await userWallet.signMessage("Add song: SONG_URI")
    console.log("Signature is: " + signature)
    try {

        const result = await contract.addSong(
            "SONG_URI",
            "IMAGE_URI",
            "TITLE",
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TAG")),
            signature
        )
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
