// scripts/crossChainDeployAndSend.js
require("dotenv").config();
const { ethers } = require("hardhat");
const config = require("../config");

const HYPERLANE_DOMAIN_IDS = {
  baseSepolia: 84532,
  arbitrumSepolia: 421614,
  mantleSepolia: 5003,
  amoy: 80002,
  scrollSepolia: 534351,
  sepolia: 11155111,
  optimismSepolia: 11155420,
};

function getProvider(chainName) {
  const rpcEnvVar = process.env[`${chainName.toUpperCase()}_RPC_URL`];
  if (!rpcEnvVar) {
    throw new Error(`Missing RPC URL env var for chain: ${chainName}`);
  }
  return new ethers.JsonRpcProvider(rpcEnvVar);
}

async function main() {
  const privateKey = process.env.DEPLOYER_WALLET_PRIVATE_KEY;
  const userPrivateKey = process.env.USER_WALLET_PRIVATE_KEY;
  const solverPrivateKey = process.env.SOLVER_WALLET_PRIVATE_KEY;

  if (!privateKey || !solverPrivateKey || !userPrivateKey) {
    throw new Error("Missing private keys in .env");
  }

  const disburseProvider = getProvider("disburse");
  const baseSepoliaProvider = getProvider("baseSepolia");

  const disburseSigner = new ethers.Wallet(privateKey, disburseProvider);
  const solverWalletOnDisburse = new ethers.Wallet(solverPrivateKey, disburseProvider);
  const userWalletOnBaseSepolia = new ethers.Wallet(userPrivateKey, baseSepoliaProvider);

  const chainNames = [
    "baseSepolia",
    "arbitrumSepolia",
    "mantleSepolia",
    "amoy",
    "scrollSepolia",
    "sepolia",
    "optimismSepolia",
  ];

  const remoteDepositAddresses = {
    baseSepolia: "0x632938C9Fe97346d6fbE34b9E60ccd04a91070AF",
    arbitrumSepolia: "0xcbBD5FaFFf40bc16df0085ba18202E035050e727",
    mantleSepolia: "0x9aed293AFe991DA13E9Ee27dF65f061b86eeB87e",
    amoy: "0x7c3482CcAE5090e1C72a0407085d52e15f44974D",
    scrollSepolia: "0x53Ea58e0956b308f0812016D3c606f08f2872BDa",
    sepolia: "0x495882C3180a8f08E5722e57ff41d301FE53B787",
    optimismSepolia: "0x694B980d92b1b2fdB150d2fa3A6Adeb05B5f3f87",
  };

  console.log("\n--- 💰 Fetching deposit from baseSepolia ---");
  const remoteDeposit = await ethers.getContractAt(
    "RemoteDeposit",
    remoteDepositAddresses["baseSepolia"],
    baseSepoliaProvider
  );

  const depositTx = await remoteDeposit.connect(userWalletOnBaseSepolia).deposit({ value: ethers.parseEther("0.0035") });
  const receipt = await depositTx.wait();
  console.log("✅ User deposited 0.0035 ETH to RemoteDeposit on baseSepolia.");

  const RemoteDepositFactory = await ethers.getContractFactory("RemoteDeposit");
  const iface = new ethers.Interface(RemoteDepositFactory.interface.fragments);

  const logs = receipt.logs
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter((log) => log && log.name === "FundsDeposited");

  let totalDeposited = 0n;
  for (const log of logs) {
    const { user, amount, requestId } = log.args;
    totalDeposited += amount;
    console.log(`\n📦 EventLog:`);
    console.log(`  - User: ${user}`);
    console.log(`  - Amount: ${ethers.formatEther(amount)} ETH`);
    console.log(`  - Request ID: ${requestId.toString()}`);
  }

  // Sample outgoing distribution
  const recipients = [
    "0xeB0B0C6212676498525939F949ce2990A8797B51",
    "0x9fF79496C69751186aD8bD9Ee8cF9ABbEAf4e2b5",
    "0xdA0853B7348ffE03826C6d221fd89EDA123658F0",
    "0xa027aDC479E4498FC187d8C8e27c3Ff1a30395De",
    "0xfC92C5f5dDAc06651244d959C1A32BCdbaCEcC53"
  ];

  const amount = ethers.parseEther("0.00005");
  const totalSend = amount * BigInt(recipients.length) * BigInt(chainNames.length);

  if (totalSend > totalDeposited) {
    throw new Error("❌ Not enough ETH deposited to cover distribution");
  }

  const distributions = chainNames.map((chainName) => {
    const domainId = HYPERLANE_DOMAIN_IDS[chainName];
    return [
      recipients,
      Array(recipients.length).fill(amount),
      amount * BigInt(recipients.length),
      domainId
    ];
  });

  const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["tuple(address[],uint256[],uint256,uint32)[]"],
    [distributions]
  );

  const rawHash = ethers.keccak256(encodedData);
  const signature = await solverWalletOnDisburse.signMessage(ethers.getBytes(rawHash));

  console.log("\n📝 Data signed by solver:", signature);


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

  console.log("\nDispatching multiSend...");
  const tx = await multiSender.multiSend(encodedData, signature);
  const receiptMultiSend = await tx.wait();
  console.log(`multiSend dispatched. TxHash: ${receiptMultiSend}`);

}

main().catch((error) => {
  console.error("❌ Error in script:", error);
  process.exit(1);
});
