const ethers = require('ethers')
const bip39 = require('bip39')
const ETH_DERIVATION_PATH = 'm/44\'/60\'/0\'/0'

exports.generate = async function generate() {
    const mnemonic = bip39.generateMnemonic()
    return mnemonic
}

exports.derive = async function derive(mnemonic, amount) {
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
    let keys = []
    let addresses = []
    for (let i = 1; i <= amount; i++) {
        const derivePath = node.derivePath(ETH_DERIVATION_PATH + '/' + i)
        const privkey = derivePath.privateKey
        const address = derivePath.address
        keys.push(privkey)
        addresses.push(address)
    }
    return { keys, addresses }
}
