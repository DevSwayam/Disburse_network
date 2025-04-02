# 🧠 Disburse Solver Server

A lightweight Express.js API that validates user deposits, verifies disbursement intents, and either signs or relays transactions to the Disburse Rollup.

---

## 🚀 What This Server Does

1. **Receives a POST `/solve` request** with:
   - `txId`: User's deposit transaction hash
   - `userAddress`: Wallet that made the deposit
   - `chainName`: Source chain (e.g., `baseSepolia`, `mantleSepolia`...)
   - `intentType`: `self` or `solver`
   - `encodedData`: ABI-encoded disbursement intent

2. **Verifies deposit** from on-chain logs using the RemoteDeposit contract.
3. **Decodes and calculates totalRequired** ETH to be disbursed.
4. **Checks if user deposited enough ETH**.
5. **Signs the intent** (if `self`) or **submits it via MultiSender** (if `solver`).

---

## 🔧 Setup & Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/your-org/solver-server.git
cd solver-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
SOLVER_PRIVATE_KEY=your_solver_wallet_private_key
MULTISENDER_ADDRESS=0xYourDeployedMultiSender
DISBURSE_RPC_URL=http://your-disburse-rollup-url:8547
BASESEPOLIA_RPC_URL=https://rpc.base.sepolia... # and so on for all chains
```

### 4. Start the server
```bash
node index.js
```

> The server will be live on `http://localhost:3000`

---

## 🧪 Sample Request

```bash
curl -X POST http://localhost:3000/solve \
  -H "Content-Type: application/json" \
  -d '{
    "txId": "0x...",
    "userAddress": "0xYourUserAddress",
    "chainName": "baseSepolia",
    "intentType": "self",
    "encodedData": "0x..."
  }'
```

---

## 🧩 How It Works

### `/solve` endpoint flow:
1. Receives a deposit intent payload.
2. Decodes the disbursement `encodedData`.
3. Calculates `totalRequired` by summing all `distribution.amount` values.
4. Uses chain RPC to fetch logs from `RemoteDeposit` contract.
5. If valid:
   - Signs the data (if `self` intent)
   - Calls `multiSend()` on MultiSender contract (if `solver` intent)

---

## 📁 Folder Structure

```
├── abis/
│   ├── MultiSender.json
│   └── RemoteDeposit.json
├── contracts.js         # Handles provider + contract instantiation
├── signer.js            # Signs or broadcasts via MultiSender
├── verifier.js          # Checks deposit logs from source chain
├── index.js             # Main server entrypoint
└── .env                 # Private keys + RPC URLs
```

---

## 🔐 Security Considerations
- Assumes trusted user intent (e.g., encodedData is user-prepared)
- Only signs or sends if the verified amount is sufficient
- Uses on-chain logs, not balances

---

## ✅ Supported Chains

| Chain Name        | Contract Address |
|------------------|------------------|
| baseSepolia       | 0x632938C9Fe...  |
| arbitrumSepolia   | 0xcbBD5FaFFf...  |
| mantleSepolia     | 0x9aed293AF...   |
| amoy              | 0x7c3482CcAE...  |
| scrollSepolia     | 0x53Ea58e095...  |
| sepolia           | 0x495882C318...  |
| optimismSepolia   | 0x694B980d92...  |

---

## 🌐 Deployment

You can easily deploy the server to services like:
- [Vercel (Serverless Functions)](https://vercel.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)

---

## 🧠 Built By
- ⚡ Solver logic by Team Disburse
- 🤝 Works seamlessly with the [Disburse App](https://disburse.network)
- 🧩 Powered by Ethers.js v6 + Express

---
