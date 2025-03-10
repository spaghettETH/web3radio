const { ethers } = require("ethers");
const { derive } = require('../_address')
const fs = require('fs');
const axios = require('axios');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('../contracts/artifacts/contracts/DecentraLiveSchedule.sol/DecentraLiveSchedule.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_addresses.ScheduleLive, ABI.abi, wallet)
    const { keys } = await derive(configs.owner_mnemonic, 2)
    const scheduleTitle = "TEST_SCHEDULE"
    const scheduleImageUrl = "https://i.imgur.com/OlSDaNk.jpeg"
    const scheduleLivestreamUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    const scheduleTag = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TAG"))
    const nextHourInSeconds = Math.floor((new Date().getTime() / 1000) + 3600) // One hour from now
    const scheduleSlotTimestamp = Math.floor(nextHourInSeconds / 1800) * 1800 // Round to nearest 30-min slot
    const scheduleSlot = 1
    console.log("Schedule slot timestamp is: " + scheduleSlotTimestamp)
    const userWallet = new ethers.Wallet(keys[1]).connect(provider)
    console.log("User wallet is: " + userWallet.address)
    const signature = await userWallet.signMessage("Schedule event: " + scheduleTitle)
    console.log("Signature is: " + signature)
    try {
        const result = await contract.scheduleEvent(
            scheduleTitle,
            scheduleImageUrl,
            scheduleLivestreamUrl,
            scheduleTag,
            scheduleSlotTimestamp,
            scheduleSlot,
            signature
        )
        console.log("Scheduled event at:", result)
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
