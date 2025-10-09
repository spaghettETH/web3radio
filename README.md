
# Web3 Audio Player DApp

# Sync submodules

```bash
pnpm init:submodule
```

# Install dependencies

```bash
pnpm install
```

# Build mego-wallet

```bash
pnpm build:mego
```

# Start the project

```bash
pnpm start
```

```
web3radio
├─ README.md
├─ disclaimer.md
├─ package.json
├─ packages
│  ├─ contracts
│  │  ├─ configs
│  │  │  └─ example.json
│  │  ├─ contracts
│  │  │  ├─ DecentraLiveSchedule.sol
│  │  │  └─ DecentraPlaylist.sol
│  │  ├─ flows
│  │  │  └─ 00_deploy_optimism.sh
│  │  ├─ hardhat.config.js
│  │  ├─ package.json
│  │  ├─ scripts
│  │  │  ├─ _address.js
│  │  │  ├─ _network.js
│  │  │  ├─ _task.js
│  │  │  ├─ _verify.js
│  │  │  ├─ deploy.js
│  │  │  ├─ live
│  │  │  │  ├─ relay-schedule.js
│  │  │  │  ├─ schedule.js
│  │  │  │  └─ set-proxy.js
│  │  │  ├─ passport
│  │  │  │  ├─ abi.json
│  │  │  │  ├─ mint.js
│  │  │  │  └─ minted.js
│  │  │  └─ playlist
│  │  │     ├─ add-song.js
│  │  │     ├─ relay-remove-save.js
│  │  │     ├─ relay-remove-song.js
│  │  │     ├─ relay-save-mego.js
│  │  │     ├─ relay-save.js
│  │  │     ├─ relay-song-mego.js
│  │  │     ├─ relay-song.js
│  │  │     └─ set-proxy.js
│  │  └─ yarn.lock
│  ├─ frontend
│  │  ├─ package.json
│  │  ├─ pnpm-lock.yaml
│  │  ├─ public
│  │  │  ├─ Full_Screen.svg
│  │  │  ├─ Mp3Back.svg
│  │  │  ├─ Mp3Next.svg
│  │  │  ├─ Mp3Pause.svg
│  │  │  ├─ Mp3Play.svg
│  │  │  ├─ Plus.svg
│  │  │  ├─ Sound.svg
│  │  │  ├─ apple.svg
│  │  │  ├─ arrowBack.svg
│  │  │  ├─ cross.svg
│  │  │  ├─ email.svg
│  │  │  ├─ eyes.svg
│  │  │  ├─ favicon.ico
│  │  │  ├─ fork.svg
│  │  │  ├─ google.svg
│  │  │  ├─ headphone.svg
│  │  │  ├─ imageLogo.svg
│  │  │  ├─ index.html
│  │  │  ├─ logo.svg
│  │  │  ├─ logo192.png
│  │  │  ├─ logo512.png
│  │  │  ├─ manifest.json
│  │  │  ├─ mego.svg
│  │  │  ├─ megoLetter.svg
│  │  │  ├─ metamask.svg
│  │  │  ├─ mp3_placeholder.jpg
│  │  │  ├─ play.svg
│  │  │  ├─ robots.txt
│  │  │  ├─ stubbs
│  │  │  │  ├─ stubb_cover_1.jpg
│  │  │  │  └─ stubb_music_1.mp3
│  │  │  ├─ title.svg
│  │  │  ├─ trash.svg
│  │  │  ├─ turnOff.svg
│  │  │  └─ walletconnect.svg
│  │  ├─ src
│  │  │  ├─ App.css
│  │  │  ├─ App.test.js
│  │  │  ├─ App.tsx
│  │  │  ├─ components
│  │  │  │  ├─ BackgroundSite.tsx
│  │  │  │  ├─ BookedSlot.tsx
│  │  │  │  ├─ ClaimSoulBoundToken.tsx
│  │  │  │  ├─ ConnectWithMego.tsx
│  │  │  │  ├─ Donate.tsx
│  │  │  │  ├─ Footer.tsx
│  │  │  │  ├─ FormatBannerInfo.tsx
│  │  │  │  ├─ GridBackground.tsx
│  │  │  │  ├─ Layout.tsx
│  │  │  │  ├─ LeaderboardTable.tsx
│  │  │  │  ├─ LoaderSkelethon.tsx
│  │  │  │  ├─ Logo.tsx
│  │  │  │  ├─ MySavesAudio.tsx
│  │  │  │  ├─ PlayBar.tsx
│  │  │  │  ├─ Playlist.tsx
│  │  │  │  ├─ RadioModality.tsx
│  │  │  │  ├─ ReportAbuse.tsx
│  │  │  │  ├─ SavedAudio.tsx
│  │  │  │  ├─ SavesLeaderboard.tsx
│  │  │  │  ├─ ScheduleLive.tsx
│  │  │  │  ├─ Stubber.tsx
│  │  │  │  ├─ SubmitSongForm.tsx
│  │  │  │  ├─ SubmittedUserSongs.tsx
│  │  │  │  ├─ Title.tsx
│  │  │  │  ├─ Web3AudioPlayer.tsx
│  │  │  │  ├─ popups
│  │  │  │  │  ├─ StreamingPlatformBanner.tsx
│  │  │  │  │  └─ SubmittingPlatformBanner.tsx
│  │  │  │  ├─ streaming
│  │  │  │  │  └─ StreamingContent.tsx
│  │  │  │  └─ utils
│  │  │  │     └─ Tags.ts
│  │  │  ├─ context
│  │  │  │  ├─ PopupContext.tsx
│  │  │  │  └─ Web3RadioContext.tsx
│  │  │  ├─ contracts
│  │  │  │  ├─ DecentralizePlaylist
│  │  │  │  │  └─ contract.ts
│  │  │  │  ├─ ScheduleLive
│  │  │  │  │  └─ contract.ts
│  │  │  │  └─ SoulBoundToken
│  │  │  │     └─ contract.ts
│  │  │  ├─ disclaimer.html
│  │  │  ├─ index.css
│  │  │  ├─ index.tsx
│  │  │  ├─ interfaces
│  │  │  │  └─ interface.ts
│  │  │  ├─ logo.svg
│  │  │  ├─ reportWebVitals.js
│  │  │  ├─ setupTests.js
│  │  │  ├─ styles
│  │  │  │  └─ AnimatedBorder.css
│  │  │  └─ utils
│  │  │     └─ Utils.ts
│  │  ├─ tailwind.config.js
│  │  └─ tsconfig.json
│  └─ submodules
│     └─ react-components
│        ├─ package.json
│        ├─ packages
│        │  ├─ core
│        │  │  ├─ package.json
│        │  │  ├─ src
│        │  │  │  ├─ components
│        │  │  │  │  ├─ CustomizationProvider.tsx
│        │  │  │  │  └─ Web3ClientProvider.tsx
│        │  │  │  ├─ index.tsx
│        │  │  │  └─ interfaces
│        │  │  │     └─ CustomStyle.ts
│        │  │  └─ tsconfig.json
│        │  ├─ test
│        │  │  ├─ next-env.d.ts
│        │  │  ├─ next.config.js
│        │  │  ├─ package.json
│        │  │  ├─ postcss.config.js
│        │  │  ├─ src
│        │  │  │  ├─ app
│        │  │  │  │  ├─ globals.css
│        │  │  │  │  ├─ layout.tsx
│        │  │  │  │  └─ page.tsx
│        │  │  │  └─ components
│        │  │  │     ├─ providers
│        │  │  │     │  └─ Providers.tsx
│        │  │  │     └─ status
│        │  │  │        ├─ MegoPreview.tsx
│        │  │  │        └─ PaymentPreview.tsx
│        │  │  ├─ tailwind.config.js
│        │  │  └─ tsconfig.json
│        │  └─ wallet
│        │     ├─ interfaces
│        │     │  ├─ CustomStyle.ts
│        │     │  └─ PaymentMethod.ts
│        │     ├─ package.json
│        │     ├─ src
│        │     │  ├─ components
│        │     │  │  ├─ Loader.tsx
│        │     │  │  ├─ MegoModal.tsx
│        │     │  │  ├─ MegoPopup.tsx
│        │     │  │  ├─ WalletButton.tsx
│        │     │  │  ├─ WalletConnectButton.tsx
│        │     │  │  ├─ icons
│        │     │  │  │  ├─ AppleIcon.tsx
│        │     │  │  │  ├─ AppleWalletIcon.tsx
│        │     │  │  │  ├─ ArrowBackIcon.tsx
│        │     │  │  │  ├─ CheckIcon.tsx
│        │     │  │  │  ├─ CopyIcon.tsx
│        │     │  │  │  ├─ CrossIcon.tsx
│        │     │  │  │  ├─ DisconnectIcon.tsx
│        │     │  │  │  ├─ EmailIcon.tsx
│        │     │  │  │  ├─ ErrorIcon.tsx
│        │     │  │  │  ├─ ExportKeyIcon.tsx
│        │     │  │  │  ├─ GoogleIcon.tsx
│        │     │  │  │  ├─ GoogleWalletIcon.tsx
│        │     │  │  │  ├─ MegoIcon.tsx
│        │     │  │  │  ├─ MegoLetter.tsx
│        │     │  │  │  ├─ QrCodeIcon.tsx
│        │     │  │  │  ├─ StripeIcon.tsx
│        │     │  │  │  ├─ TurnOffIcon.tsx
│        │     │  │  │  ├─ WalletConnect.tsx
│        │     │  │  │  └─ cryptos
│        │     │  │  │     ├─ ArbitrumIcon.tsx
│        │     │  │  │     ├─ EtheriumIcon.tsx
│        │     │  │  │     ├─ OptimismIcon.tsx
│        │     │  │  │     ├─ PolygonIcon.tsx
│        │     │  │  │     ├─ StripeIcon.tsx
│        │     │  │  │     └─ UsdcIcon.tsx
│        │     │  │  ├─ mego-style.css
│        │     │  │  ├─ payments
│        │     │  │  │  ├─ components
│        │     │  │  │  │  ├─ BuyCheckNFTAndMint.tsx
│        │     │  │  │  │  ├─ BuyTicketClaim.tsx
│        │     │  │  │  │  ├─ BuyTicketClaimGeneration.tsx
│        │     │  │  │  │  ├─ BuyTicketForm.tsx
│        │     │  │  │  │  ├─ BuyTicketProcessing.tsx
│        │     │  │  │  │  ├─ BuyTicketWithStripe.tsx
│        │     │  │  │  │  ├─ ClaimTicketButton.tsx
│        │     │  │  │  │  ├─ MegoBuyTicketModal.tsx
│        │     │  │  │  │  ├─ PaymentsCollectors.tsx
│        │     │  │  │  │  ├─ Ticket.tsx
│        │     │  │  │  │  ├─ TicketHeader.tsx
│        │     │  │  │  │  ├─ TicketLocation.tsx
│        │     │  │  │  │  ├─ TicketPayment.tsx
│        │     │  │  │  │  └─ TicketUserNFT.tsx
│        │     │  │  │  ├─ context
│        │     │  │  │  │  └─ BuyTicketContext.tsx
│        │     │  │  │  ├─ interfaces
│        │     │  │  │  │  ├─ interface-stepper.ts
│        │     │  │  │  │  ├─ messages-enums.ts
│        │     │  │  │  │  └─ popup-enum.ts
│        │     │  │  │  └─ utils
│        │     │  │  │     ├─ BuyTicketUtils.ts
│        │     │  │  │     ├─ CryptoUtils.ts
│        │     │  │  │     ├─ DateUtils.ts
│        │     │  │  │     ├─ PaymentUtils.ts
│        │     │  │  │     └─ SignatureUtils.ts
│        │     │  │  └─ web3-context.tsx
│        │     │  └─ index.tsx
│        │     └─ tsconfig.json
│        ├─ pnpm-lock.yaml
│        ├─ pnpm-workspace.yaml
│        └─ readme.md
├─ pnpm-lock.yaml
└─ pnpm-workspace.yaml

```