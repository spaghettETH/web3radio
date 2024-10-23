
# Web3 Audio Player DApp

This project is a decentralized web application (DApp) that allows users to upload songs to the InterPlanetary File System (IPFS) via [Pinata.cloud](https://pinata.cloud/) and interact with a smart contract deployed on the Ethereum blockchain. Users can submit songs, view a playlist, and remove songs they've submitted. A connected Ethereum wallet (e.g., MetaMask) is required to interact with the DApp.

## Features

- **Upload Songs**: Users can upload songs (e.g., `.mp3`, `.wav`, `.ogg` files) to IPFS using Pinata and submit them to the playlist.
- **Audio Player**: A playlist that fetches songs from IPFS and allows users to listen to them.
- **User-Specific Actions**: Users can remove the songs they have submitted, and whitelisted users can remove any song.
- **Web3 Integration**: MetaMask is used to connect with the Ethereum network, and smart contracts handle song submissions and removals.
  
## Requirements

To run this project, you will need the following:

1. **Node.js**: Make sure you have Node.js installed. You can download it [here](https://nodejs.org/).
2. **MetaMask**: Install the MetaMask browser extension from [here](https://metamask.io/).
3. **Pinata Account**: Sign up for [Pinata](https://pinata.cloud/) and generate API keys for uploading files to IPFS.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/web3-audio-player.git
cd web3-audio-player
```

### 2. Install Dependencies

Run the following command to install the necessary packages:

```bash
npm install
```

The key libraries and dependencies used in this project are:

- **React**: JavaScript library for building the user interface.
- **Ethers.js**: A library for interacting with the Ethereum blockchain.
- **Axios**: HTTP client for uploading files to Pinata's IPFS service.
- **ReactPlayer**: A React component to embed media players.

### 3. Create Environment Variables

To securely store your Pinata API key and secret, create a `.env` file in the root directory with the following content:

```
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_API_KEY=your_pinata_secret_key
```

Replace `your_pinata_api_key` and `your_pinata_secret_key` with the values from your Pinata account.

### 4. Compile Smart Contracts

You will need to deploy the smart contracts to an Ethereum testnet (such as Rinkeby or Goerli) or a local blockchain using tools like **Hardhat** or **Truffle**. The smart contract used in this project handles:
- Adding songs to a playlist.
- Removing songs (either by the submitter or a whitelisted address).

After deploying the smart contract, update the contract address and ABI in your project.

### 5. Run the Application

Once everything is set up, you can start the application with:

```bash
npm start
```

The app will be available at `http://localhost:3000`.

## Project Structure

- `src/components/`: Contains all the React components, including the form for submitting songs, the audio player, and the user's song management interface.
- `src/contracts/`: Contains the Solidity smart contracts (optional if you decide to include them here).
- `public/`: The public folder for the app's assets and index file.

### Key Components

- **App.js**: The main component that connects to MetaMask, manages the contract instance, and handles state for the playlist and user's songs.
- **SubmitSongForm.js**: The form that allows users to upload and submit songs to the playlist.
- **AudioPlayer.js**: The audio player component that streams songs from IPFS.
- **RemoveOwnSong.js**: Allows users to manage and remove the songs they have submitted.

## How it Works

1. **Connect MetaMask**: The app connects to MetaMask when launched. Ensure that you are connected to the correct Ethereum network (e.g., Goerli testnet).
2. **Upload Song**: Users can choose a song file and upload it to IPFS via Pinata. Once uploaded, the IPFS hash is returned and stored on the Ethereum blockchain by calling the smart contract’s `addSong()` function.
3. **View Playlist**: The playlist is updated with the newly uploaded song, and users can stream songs directly from IPFS.
4. **Remove Song**: Users can remove their own submitted songs via the `removeOwnSong()` function in the contract.

## Dependencies

Make sure the following dependencies are installed in your project:

```json
{
  "dependencies": {
    "axios": "^0.27.2",
    "ethers": "^5.7.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-scripts": "5.0.1",
    "react-player": "^2.10.1"
  }
}
```

## Pinata API Setup

To upload files to IPFS, create a Pinata account and generate an API key:

1. Go to [Pinata](https://pinata.cloud/), sign up, and log in.
2. Navigate to **API Keys** and create a new key with the necessary permissions:
   - `pinFileToIPFS`
   - `pinList`
   - `unpin` (optional)
3. Copy the **API key** and **API secret** into your `.env` file as shown above.

## Smart Contract

The smart contract is written in **Solidity** and deployed on the Ethereum blockchain. You can find the contract in the `contracts` folder. Key features include:
- `addSong`: Allows users to submit a song (IPFS URI) and its title to the blockchain.
- `removeOwnSong`: Allows users to remove songs they have submitted.
- `generatePlaylist`: Returns the shuffled playlist with songs and their metadata (IPFS URI and title).

You will need to deploy this contract to a blockchain (e.g., a testnet or a local environment) and use the contract address in the app.

## Future Enhancements

- Implement a search or filter functionality for the playlist.
- Integrate a pinning service that ensures files stay pinned on IPFS.
- Add support for different audio formats and improved player controls.
- Add user authentication using NFT ownership.

## License

This project is licensed under the MIT License.
