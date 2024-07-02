import hre from "hardhat";

export async function deployMatchTicketFixture() {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const MatchTicket = await hre.ethers.getContractFactory("RedTickets");
  const matchTicket = await MatchTicket.deploy(owner.address);

  return { matchTicket, owner, otherAccount };
}
