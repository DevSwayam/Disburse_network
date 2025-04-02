// scripts/crossChainDeployAndSend.js
require("dotenv").config();
const { ethers } = require("hardhat");
const config = require("../config");

/**
 * Example domain IDs for Hyperlane test networks.
 * Replace these with the correct domain IDs for each chain.
 */
const HYPERLANE_DOMAIN_IDS = {
  baseSepolia: 84532,
  arbitrumSepolia: 421614,
  mantleSepolia: 5003,
  amoy: 80002,
  scrollSepolia: 534351,
  sepolia: 11155111,
  optimismSepolia: 11155420,
};

/**
 * Helper: returns a new ethers.JsonRpcProvider from an env var like "BASE_SEPOLIA_RPC_URL".
 * e.g. getProvider("baseSepolia") -> process.env.BASE_SEPOLIA_RPC_URL
 */
function getProvider(chainName) {
  const rpcEnvVar = process.env[`${chainName.toUpperCase()}_RPC_URL`];
  if (!rpcEnvVar) {
    throw new Error(`Missing RPC URL env var for chain: ${chainName}`);
  }
  return new ethers.JsonRpcProvider(rpcEnvVar);
}

async function main() {
  // ------------------------------------------------------------------
  // A. Set up your signers
  // ------------------------------------------------------------------
  const privateKey = process.env.DEPLOYER_WALLET_PRIVATE_KEY;
  const solverPrivateKey = process.env.SOLVER_WALLET_PRIVATE_KEY;

  if (!privateKey || !solverPrivateKey) {
    throw new Error("Missing private keys in .env");
  }

  // We'll deploy MultiSender on 'disburse' specifically:
  const disburseProvider = getProvider("disburse");
  const disburseSigner = new ethers.Wallet(privateKey, disburseProvider);
  const solverWalletOnDisburse = new ethers.Wallet(solverPrivateKey, disburseProvider);

  // ------------------------------------------------------------------
  // B. Deploy RemoteRecipient on each chain and fund with 0.05
  // ------------------------------------------------------------------
  const chainNames = [
    "baseSepolia",
    "arbitrumSepolia",
    "mantleSepolia",
    "amoy",
    "scrollSepolia",
    "sepolia",
    "optimismSepolia",
  ];

  const remoteRecipientAddresses = {}; // { chainName: "0xDeployedContract..." }

//   for (const chainName of chainNames) {
//     console.log(`\n--- Deploying RemoteRecipient on ${chainName} ---`);

//     // 1) Create provider & signer for the chain
//     const provider = getProvider(chainName);
//     const signer = new ethers.Wallet(privateKey, provider);

//     // 2) Deploy RemoteRecipient
//     const RemoteRecipientFactory = await ethers.getContractFactory("RemoteRecipient", signer);
//     const remoteRecipient = await RemoteRecipientFactory.deploy();
//     await remoteRecipient.waitForDeployment();

//     const remoteRecipientAddress = await remoteRecipient.getAddress();
//     remoteRecipientAddresses[chainName] = remoteRecipientAddress;

//     console.log(`${chainName} RemoteRecipient deployed at: ${remoteRecipientAddress}`);

//     // 3) Fund with 0.05 native token
//     //    (On testnets, this will be test ETH, test AVAX, etc.)
//     const fundingAmount = ethers.parseEther("0.05");
//     const fundTx = await signer.sendTransaction({
//       to: remoteRecipientAddress,
//       value: fundingAmount,
//     });
//     await fundTx.wait();
//     console.log(`Funded RemoteRecipient on ${chainName} with ${fundingAmount} wei.`);
//   }

  // ------------------------------------------------------------------
  // C. Deploy MultiSender on Disburse
  // ------------------------------------------------------------------
  
  
  const MultiSenderFactory = await ethers.getContractFactory("MultiSender", disburseSigner);
  const multiSender = await MultiSenderFactory.deploy(
    config.disburse.mailbox,      // mailbox address on disburse
    config.solverAddress          // solver address you trust
  );
  await multiSender.waitForDeployment();
  const multiSenderAddress = await multiSender.getAddress();
  console.log(`\nMultiSender deployed on disburse at: ${multiSenderAddress}`);

  // ------------------------------------------------------------------
  // D. Prepare array of RemoteRecipients for MultiSender.initialize()
  //    struct RemoteRecipient { address recipient; uint32 chainId; }
  // ------------------------------------------------------------------
  let remoteRecipientStructs = [
    {
      recipient: '0xb21eB381e46db59B57E6A495B8BA790809F459AE',
      chainId: 84532
    },
    {
      recipient: '0x16ffBE3A6d8B54D7fd7CE83CF63fE7521B6c5Ee2',
      chainId: 421614
    },
    {
      recipient: '0x4AF371b2acF58f71c101a5736653b5e7431BEc47',
      chainId: 5003
    },
    {
      recipient: '0xF66182EB072fA7F2bf1a5542Bbc42fAFF85B42b5',
      chainId: 80002
    },
    {
      recipient: '0x7d94481934900BcF06185aD36E0DA70396127594',
      chainId: 534351
    },
    {
      recipient: '0x34bE8237Da6CA79e3EFeB58aB8DC5dED20fb8E81',
      chainId: 11155111
    },
    {
      recipient: '0x9e3BAF1809dbf8D202A27f70DDb458862fC1fAd5',
      chainId: 11155420
    }
  ];

  console.log("\n--- RemoteRecipient structs ---");

  // Call initialize with the array
  const initTx = await multiSender.initialize(remoteRecipientStructs);
  await initTx.wait();
  console.log("MultiSender initialized with all remote recipients.");

  // ------------------------------------------------------------------
  // E. Prepare distributions for each chain
  // ------------------------------------------------------------------
  // For each chain, we can do a distribution. Here's a simple example
  // distributing to 2 addresses, total = sums of amounts.
  // Make sure to adjust domain IDs to your environment.
  //
  // Each `Distribution` is: [address[], uint256[], uint256, uint32]
  // where the last item is the hyperlane domain ID.
  const distributions = [];

  // Example recipients
  const recipients = [
    "0xeB0B0C6212676498525939F949ce2990A8797B51",
    "0x9fF79496C69751186aD8bD9Ee8cF9ABbEAf4e2b5",
    "0xdA0853B7348ffE03826C6d221fd89EDA123658F0",
    "0xa027aDC479E4498FC187d8C8e27c3Ff1a30395De",
    "0xfC92C5f5dDAc06651244d959C1A32BCdbaCEcC53"
  ];

  let finalTotal = 0n; 

  for (const chainName of chainNames) {
    const domainId = HYPERLANE_DOMAIN_IDS[chainName];

    // amounts: each address gets 0.01
    // total: 0.02
    const amount1 = ethers.parseEther("0.0001");
    const amount2 = ethers.parseEther("0.0001");
    const amount3 = ethers.parseEther("0.0001");
    const amount4 = ethers.parseEther("0.0001");
    const amount5 = ethers.parseEther("0.0001");
    const total = 500000000000000n; // BN addition
    finalTotal += total;

    distributions.push([
      recipients,                // address[]
      [amount1, amount2, amount3,amount4,amount5],       // uint256[]
      total,                     // uint256 totalAmount
      domainId                  // uint32 chainId (Hyperlane domain)
    ]);
  }

  // ------------------------------------------------------------------
  // F. Encode distributions & sign with solver
  // ------------------------------------------------------------------
  // Note: In your real script, you might gather these distributions
  // from an off-chain aggregator or "solver".
  const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["tuple(address[],uint256[],uint256,uint32)[]"],
    [distributions]
  );

  console.log("\n--- Encoded Data ---");
    console.log(encodedData);

    

  console.log("\nDispatching multiSend...");
  const tx = await multiSender.connect(solverWalletOnDisburse).multiSendWithNativeEth(encodedData,{value: finalTotal});
  const receipt = await tx.wait();
  console.log(`multiSend dispatched. TxHash: ${receipt.transactionHash}`);

  console.log("\nAll done!");
}

// Execute
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
