const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  // Deploy Playlist
  console.log('Deploying Playlist contract..')
  const Playlist = await hre.ethers.getContractFactory("DecentraPlaylist");
  const playlist = await Playlist.deploy(configs.passport_address);
  console.log('Deploy transaction is: ' + playlist.deployTransaction.hash)
  await playlist.deployed();
  console.log("Playlist contract deployed to:", playlist.address);
  configs.contract_addresses.Playlist = playlist.address

  // Deploy ScheduleLive
  console.log('Deploying ScheduleLive contract..')
  const ScheduleLive = await hre.ethers.getContractFactory("DecentraLiveSchedule");
  const scheduleLive = await ScheduleLive.deploy(configs.passport_address);
  console.log('Deploy transaction is: ' + scheduleLive.deployTransaction.hash)
  await scheduleLive.deployed();
  console.log("ScheduleLive contract deployed to:", scheduleLive.address);
  configs.contract_addresses.ScheduleLive = scheduleLive.address

  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
