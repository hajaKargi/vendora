import dotenv from "dotenv";
import path from "path";
import { Account, Contract, Provider } from "starknet";

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Debug: Check if env variables are loaded
console.log("ENV Variables:", {
  network: process.env.STARKNET_NETWORK,
  account: process.env.STARKNET_ACCOUNT,
  privateKey: process.env.STARKNET_PRIVATE_KEY?.substring(0, 10) + "...",
});

async function main() {
  // Initialize provider
  const provider = new Provider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6",
  });

  // Initialize account
  const account = new Account(
    provider,
    process.env.STARKNET_ACCOUNT!,
    process.env.STARKNET_PRIVATE_KEY!
  );

  // Use pre-deployed contract address
  const contractAddress =
    "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10";
  console.log("Using contract at:", contractAddress);

  // Initialize contract
  const contract = new Contract(
    [
      {
        name: "constructor",
        type: "function",
        inputs: [
          { name: "name", type: "felt" },
          { name: "symbol", type: "felt" },
          { name: "owner", type: "felt" },
        ],
        outputs: [],
      },
      {
        name: "balance_of",
        type: "function",
        inputs: [
          { name: "account", type: "felt" },
          { name: "id", type: "felt" },
        ],
        outputs: [{ name: "balance", type: "felt" }],
      },
    ],
    contractAddress,
    provider
  );
  contract.connect(account);

  // Check balance
  const balance = await contract.balance_of(account.address, 1);
  console.log("NFT Balance:", balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
