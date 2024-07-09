import hre from "hardhat";

import { RedTickets } from "../typechain-types";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const RedTickets = await hre.ethers.getContractFactory("RedTickets");
  const redTickets = RedTickets.attach(contractAddress) as RedTickets;

  const owner = await redTickets.owner();

  // eslint-disable-next-line no-console
  console.log("Owner of the contract:", owner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
