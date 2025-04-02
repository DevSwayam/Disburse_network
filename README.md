# 🌀 Disburse Network – Hackathon Submission

## 🚀 One-liner
**Disburse is a one-click cross-chain payout network that enables mass payments across multiple chains from a single transaction.**

---

## 🔍 What We Built
Disburse is a modular intent-based payments protocol that combines:
- A custom Nitro-based Rollup (powered by Espresso)
- Hyperlane for cross-chain messaging
- A solver network for liquidity
- An expressive MultiSender contract for native token disbursements

You can:
- Deposit funds on any supported chain
- Submit an intent (distribution plan)
- Have the solver verify, sign, and route payments
- Seamlessly send payouts to multiple chains in one go

---

## 🛠️ Architecture Overview

<img width="1027" alt="Screenshot 2025-04-02 at 6 10 41 AM" src="https://github.com/user-attachments/assets/eab8d186-d95a-4eb5-86bd-28f20538c9b2" />

### 🧱 Flow Breakdown

1. **User deposits ETH** on any supported chain (e.g., Base, Mantle, Arbitrum, etc.)
2. They receive a `txHash` of their deposit transaction
3. User submits an intent to the **Solver API** with distribution data
4. Solver verifies deposit using on-chain logs from the source chain
5. If valid, Solver signs the encoded distribution intent
6. Solver sends `multiSend()` transaction on the **Disburse Rollup**
7. MultiSender contract emits the data into **Hyperlane Mailbox**
8. Hyperlane relayers send the data to destination chains
9. **RemoteRecipients** on destination chains distribute funds immediately
10. **Espresso confirms** the rollup transaction
11. **Solver reclaims their liquidity after confirmation** 🧠

---

# Disburse Rollup powered by Espresso

## What is Disburse?

**Disburse** is a one-click multi-chain payout protocol that enables developers, DAOs, and organizations to send funds to multiple chains from a single source chain. Powered by Nitro rollups via **Espresso**, Disburse ensures fast, efficient, and low-cost intent-based disbursements across chains.

It leverages **Hyperlane** for message passing and secure cross-chain communication, and uses **HotShot** for high-speed finality.

## 📊 Track Disbursement Activity

We’ve successfully disbursed to over **10,000 users across multiple testnets** including Base, Arbitrum, Mantle, Polygon, and more.

You can verify and explore recent payouts on each destination chain:

| Chain               | Explorer Link |
|---------------------|---------------|
| Base Sepolia        | [View](https://sepolia.basescan.org/address/0xb21eB381e46db59B57E6A495B8BA790809F459AE#internaltx) |
| Arbitrum Sepolia    | [View](https://sepolia.arbiscan.io/address/0x16ffBE3A6d8B54D7fd7CE83CF63fE7521B6c5Ee2#internaltx) |
| Mantle Sepolia      | [View](https://explorer.sepolia.mantle.xyz/address/0x4AF371b2acF58f71c101a5736653b5e7431BEc47?tab=internal_txns) |
| Polygon Amoy        | [View](https://amoy.polygonscan.com/address/0xF66182EB072fA7F2bf1a5542Bbc42fAFF85B42b5#internaltx) |
| Scroll Sepolia      | [View](https://sepolia.scrollscan.com/address/0x7d94481934900bcf06185ad36e0da70396127594#internaltx) |
| Ethereum Sepolia    | [View](https://sepolia.etherscan.io/address/0x34bE8237Da6CA79e3EFeB58aB8DC5dED20fb8E81#internaltx) |
| Optimism Sepolia    | [View](https://sepolia-optimism.etherscan.io/address/0x9e3BAF1809dbf8D202A27f70DDb458862fC1fAd5#internaltx) |


---

## ✅ Rollup Liveness Verification

### CreateRollup Transaction:
[`0xc081e5a3b9e7bff2899634050eb7d58fc96452350f4efb7dd33c41d7ac0a1965`](https://sepolia.arbiscan.io/tx/0xc081e5a3b9e7bff2899634050eb7d58fc96452350f4efb7dd33c41d7ac0a1965)

![image](https://github.com/user-attachments/assets/c69d9f40-979e-4d60-8752-44c2c060ace4)

---

### EC2 Instance of Deployed Espresso Rollup
![image](https://github.com/user-attachments/assets/c990559e-feff-44a8-a132-3904cf53419c)


### RPC Test Endpoint:

```bash
curl -X POST http://35.94.203.84:8547 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

**Chain ID returned:** `0x1ac7f52` (decimal: `28082002`)

## 🌐 Disburse Rollup Network Details

| Parameter                 | Value                        |
|---------------------------|------------------------------|
| **Name**                 | disburse                     |
| **Display Name**         | Disburse                     |
| **Chain ID**             | 28082002                     |
| **Domain ID**            | 28082002                     |
| **Protocol**             | Ethereum                     |
| **JSON RPC URL**         | `http://35.94.203.84:8547`   |
| **Native Token Symbol**  | ETH                          |
| **Native Token Name**    | Ether                        |
| **Native Token Decimals**| 18                           |

---

## 🧪 Testing the Chain

### Check confirmed node:

```bash
cast call --rpc-url https://arbitrum-sepolia-rpc.publicnode.com \
  0xc9A884B4F5440fc00730A52ab48a8e0Db8b30784 "latestConfirmed()(uint256)"
```

---

### Send bridge deposit from L1:

```bash
cast send --rpc-url https://arbitrum-sepolia-rpc.publicnode.com \
  0x0EB750129705fAfec85B0b1BF17B3c8bA3504602 'depositEth()' \
  --private-key $YOUR_PRIVATE_KEY --value 10000000000 -vvvv
```

> Bridging may take a few minutes to finalize.

---

### Check balances:

```bash
cast balance $YOUR_PUBLIC_ADDRESS --rpc-url http://35.94.203.84:8547
```

Or send test value:

```bash
cast send $ANY_ADDRESS --value 1 \
  --private-key $YOUR_PRIVATE_KEY \
  --rpc-url http://35.94.203.84:8547
```

---

## ✉️ Hyperlane Integration

### ✅ Deployed Contracts on Disburse Rollup

### Multichain Hyperlane Relayer 
![image](https://github.com/user-attachments/assets/eaa91463-edd0-47d9-9cc2-355debe07535)

| Contract | Address |
|---------|---------|
| **mailbox** | `0xeCcd8F6645d88F2ad3276ECdEc6afb3Cb6a1F6E0` |
| **proxyAdmin** | `0x8cd8d7fC3fDB41CA1BeC7503FBAD4d959D851281` |
| **merkleTreeHook** | `0xE34304275AD0922cbd06aa6C249d53090EA76F23` |
| **interchainAccountRouter** | `0x4926abd06FF3364aCA761567f60421006aaae4cb` |
| **interchainAccountIsm** | `0xaF238b2Fd5b5D6Ec325A6d86A6A21F8177D36FD6` |
| **validatorAnnounce** | `0xa70fda5B181DA549576CEE02C5e3110A193149EA` |
| **domainRoutingIsmFactory** | `0x88b06E1eC81c8916aB1A45cD61cD2A6969FF6858` |
| **staticAggregationHookFactory** | `0x09E935e5Bbea49b75836D2097130B22D73831237` |
| **staticAggregationIsmFactory** | `0x279D1F16b8b4953F35f9aE923a56E60464d1f220` |
| **staticMerkleRootMultisigIsmFactory** | `0x38E9912C29265E447e809c54bf9726d2444bACf9` |
| **staticMerkleRootWeightedMultisigIsmFactory** | `0x4a9D17814a82065d8AB9f43f023496a9DF13B1c1` |
| **staticMessageIdMultisigIsmFactory** | `0xb6Da6c4eC9C94C22C8f75feF2A45c78F319dC920` |
| **staticMessageIdWeightedMultisigIsmFactory** | `0xD340b26514c03c62c82a8B06841f4c5cA340d645` |
| **testRecipient** | `0x836068c6B773d38Ef13b2EEb6B64B2a279bB952a` |

**ISM Relayer & Owner Address:**  
`0x1950498e95274Dc79Fbca238C2BE53684D69886F`

---

## 🔁 Solver Server

The Solver API validates cross-chain intent deposits and signs or submits transactions:

🌐 [https://solver-server-sgre.vercel.app/solve](https://solver-server-sgre.vercel.app/solve)

Check the `solver-server` repo for logic and test cases.

---

## 🚀 Try It Live

- App: 👉 [https://disburse.network](https://disburse.network)
- Contracts: 📂 `contracts/`
- Solver: 🧠 [Solver API](https://solver-server-sgre.vercel.app/solve)

---

## 📂 Folder Guide
- `contracts/` → Solidity smart contracts
- `solver-server/` → Express.js solver backend
- `rollup/` → Nitro + Espresso Rollup config

---

## 🙌 Team & Credits
- Rollup Deployment: Vivek
- Contracts & Solver Infra: Swayam
- Hyperlane Config: [Core Addresses above]
- Design, Flow, and Coordination: Team Disburse ✨

---

## 🤝 Thanks
Built with ❤️ using:
- Espresso Systems
- Hyperlane
- Arbitrum Nitro
- Foundry + Ethers.js
- Vercel & Alchemy

Let's make cross-chain disbursements programmable and seamless ⚡

