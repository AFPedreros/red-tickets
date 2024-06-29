import { expect } from "chai";
import hre from "hardhat";

describe("RedTickets", () => {
  // async function deployTicketFixture() {
  //   const [owner, otherAccount] = await hre.ethers.getSigners();

  //   const Ticket = await hre.ethers.getContractFactory("RedTickets");
  //   const ticket = await Ticket.deploy(owner.address);

  //   return { ticket, owner, otherAccount };
  // }

  async function deployMatchTicketFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MatchTicket = await hre.ethers.getContractFactory("RedTickets");
    const matchTicket = await MatchTicket.deploy(owner.address);

    return { matchTicket, owner, otherAccount };
  }

  describe("Deployment", () => {
    it("Should set the right owner", async function () {
      const { matchTicket, owner } = await deployMatchTicketFixture();

      expect(await matchTicket.owner()).to.equal(owner.address);
    });
  });

  describe("Match Management", () => {
    it("Should set the initial ticket price correctly", async function () {
      const { matchTicket, owner } = await deployMatchTicketFixture();

      // List a match
      await matchTicket.connect(owner).listMatch(
        "América de Cali vs Deportivo Cali", // Match name
        hre.ethers.parseEther("1"), // Ticket price (1 ether)
        1000, // Max tickets
        "2024-07-01", // Date
        "20:00", // Time
        "Estadio Olímpico Pascual Guerrero", // Location
      );

      // Fetch the match details
      const matchDetails = await matchTicket.getMatch(1);

      // Check if the ticket price is set correctly
      expect(matchDetails.cost).to.equal(hre.ethers.parseEther("1"));
    });
  });
});
