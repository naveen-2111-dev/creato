import { ethers } from "ethers";
import path from "node:path";
import fs from "node:fs";
import Config from "../config.js";

async function main() {
  console.log("deploying...");

  const abi = path.resolve(
    process.cwd(),
    "artifacts/contracts_NFT_sol_MyNFT.abi"
  );

  const bin = path.resolve(
    process.cwd(),
    "artifacts/contracts_NFT_sol_MyNFT.bin"
  );

  const Abi_Json = JSON.parse(fs.readFileSync(abi, "utf-8"));
  const Bin = fs.readFileSync(bin, "utf-8");
  const RPC = Config.network.sepolia.url;
  const chain = Config.network.sepolia.chainId;
  const provider = new ethers.JsonRpcProvider(RPC);
  const Signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const contract = new ethers.ContractFactory(Abi_Json, Bin, Signer);
  const deploy = await contract.deploy();
  await deploy.waitForDeployment();

  const Deploy_Json = {
    address: deploy.target,
    chain: chain,
  };

  const buildPath = path.join(process.cwd(), "contracts", "build");
  const filepath = path.join(buildPath, "deployment.json");

  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(Deploy_Json, null, 2));
  console.log(`contract deployed to : ${deploy.target}`);
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
