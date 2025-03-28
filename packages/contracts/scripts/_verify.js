const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')
const child_process = require('child_process')
const { generate, derive } = require('./_address')
let configFile

async function run() {
    try {
        configFile = './configs/' + argv._[0] + '.json'
        const configs = JSON.parse(fs.readFileSync(configFile).toString())
        const { addresses, keys } = await derive(configs.owner_mnemonic, 10)
        console.log('Deployer address: ' + addresses[0])

        if (
            configs.network !== undefined &&
            configs.owner_mnemonic !== undefined
        ) {
            let arguments = '"' + configs.passport_address + '"'
            fs.writeFileSync('./artifacts/arguments.js', `module.exports = [` + arguments + `]`)
            child_process.execSync(
                'ETHERSCAN="' + configs.etherscan_key + '" ' +
                'PROVIDER="' + configs.provider + '" ' +
                'NETWORK="' + configs.network + '" ' +
                'npx hardhat verify --show-stack-traces --network ' + configs.network +
                ' ' + configs.contract_addresses.Playlist +
                ' --constructor-args ./artifacts/arguments.js', { stdio: 'inherit' }
            )
            child_process.execSync(
                'ETHERSCAN="' + configs.etherscan_key + '" ' +
                'PROVIDER="' + configs.provider + '" ' +
                'NETWORK="' + configs.network + '" ' +
                'npx hardhat verify --show-stack-traces --network ' + configs.network +
                ' ' + configs.contract_addresses.ScheduleLive +
                ' --constructor-args ./artifacts/arguments.js', { stdio: 'inherit' }
            )
            console.log('All done, exiting!')
            process.exit();
        } else {
            console.log('Config file missing.')
        }
    } catch (e) {
        console.log(e.message)
        process.exit()
    }
}

if (argv._ !== undefined) {
    run();
} else {
    console.log('Can\'r run verification, please use script like `yarn verify mumbai`.')
}