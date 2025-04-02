# 🧱 Disburse Contracts – Hardhat Setup

This folder contains the smart contracts and deployment scripts for the **Disburse cross-chain payout network**.

---

## ⚙️ Requirements
- Node.js >= 18
- Hardhat
- Ethers.js (v6)

---

## 📦 Install Dependencies

```bash
npm install
```

---

## 🔧 Compile Contracts

```bash
npx hardhat compile
```

---

## 🧪 Run Scripts

Each script uses `ethers` and Hardhat's runtime environment. To run any of them:

```bash
node scripts/<scriptName>.js
```

For example:

```bash
node scripts/scriptForCrossChainMultiSend.js
```

> Scripts handle RemoteDeposit deploys, MultiSender logic, disburse intents, and native ETH disbursements.

---

## 🗂 Available Scripts

### 1. `scriptForCrossChainMultiSend.js`
- Deploys RemoteDeposit contracts to all chains
- Deploys MultiSender to the Disburse Rollup
- Accepts deposits, signs intents, and disburses funds cross-chain

### 2. `deploy-multisender.js`
- Deploys only the MultiSender contract on the Disburse chain

### 3. `script.js`
- Utility deployment/test script

### 4. `scriptNativeSend.js`
- Tests native ETH transfer logic

---

## 🧾 Contracts Overview

### ✅ `RemoteDeposit.sol`
- Accepts deposits from users
- Emits `FundsDeposited(user, amount, requestId)`

### ✅ `MultiSender.sol`
- Deployed on Disburse Rollup
- Verifies signatures and calls `multiSend()`
- Emits cross-chain messages via Hyperlane Mailbox

### ✅ `RemoteRecipient.sol`
- Deployed on destination chains
- Receives and distributes funds from Mailbox message

---

## 🔐 Setup Environment Variables

Create a `.env` in the root folder:

```env
DEPLOYER_WALLET_PRIVATE_KEY=0x...
SOLVER_WALLET_PRIVATE_KEY=0x...
USER_WALLET_PRIVATE_KEY=0x...

BASE_SEPOLIA_RPC_URL=https://...
ARBITRUM_SEPOLIA_RPC_URL=https://...
SCROLL_SEPOLIA_RPC_URL=https://...
POLYGON_AMOY_RPC_URL=https://...
SEPOLIA_RPC_URL=https://...
OPTIMISM_SEPOLIA_RPC_URL=https://...
MANTLE_SEPOLIA_RPC_URL=https://...
DISBURSE_RPC_URL=http://your-rollup-node:8547
```

---

## 🧠 Notes
- All contracts are written in Solidity ^0.8.20
- ABI files can be generated via `hardhat compile`
- Uses native ETH as payout (not ERC20)

---

## 🤝 Questions?
Reach out to the Disburse team or open an issue.

