require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

let provider = 'http://0.0.0.0:8545'
let hardhatConfigs = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 3000
      }
    },
    optimism: {
      url: provider
    },
    optimismSepolia: {
      url: provider
    },
    mainnet: {
      url: provider
    }
  },
  solidity: "0.8.23",
}

if (process.env.ACCOUNTS !== undefined) {
  for (let k in hardhatConfigs.networks) {
    hardhatConfigs.networks[k].accounts = []
    for (let a in process.env.ACCOUNTS.split(',')) {
      if (k === 'hardhat') {
        hardhatConfigs.networks[k].accounts.push({
          privateKey: process.env.ACCOUNTS.split(',')[a],
          balance: "10000000000000000000000000000000000000"
        })
      } else {
        hardhatConfigs.networks[k].accounts.push(process.env.ACCOUNTS.split(',')[a])
      }
    }
  }
}

if (process.env.PROVIDER !== undefined) {
  for (let k in hardhatConfigs.networks) {
    if (k !== 'hardhat') {
      hardhatConfigs.networks[k].url = process.env.PROVIDER
    }
  }
}

if (process.env.ETHERSCAN !== undefined && process.env.ETHERSCAN !== '') {
  hardhatConfigs.etherscan = { apiKey: { mainnet: process.env.ETHERSCAN, optimisticEthereum: process.env.ETHERSCAN } }
}
if (process.env.NETWORK === 'hardhat' || process.env.NETWORK === 'localhost') {
  hardhatConfigs.etherscan = {
    apiKey: {
      hardhat: "abc"
    },
    customChains: [
      {
        network: "hardhat",
        chainId: 31337,
        urls: {
          apiURL: "http://localhost/api",
          browserURL: "http://localhost/api"
        }
      }
    ]
  }
}
module.exports = hardhatConfigs;
