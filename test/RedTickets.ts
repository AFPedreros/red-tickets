import { expect } from "chai";
import hre from "hardhat";

const MAX_TICKETS = 37899;

describe("RedTickets", () => {
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

    it("Should set the max tickets correctly", async function () {
      const { matchTicket } = await deployMatchTicketFixture();

      expect(await matchTicket.MAX_TICKETS()).to.equal(MAX_TICKETS);
    });
  });

  describe("Match Management", () => {
    it("Should set the initial ticket price correctly", async function () {
      const { matchTicket, owner } = await deployMatchTicketFixture();

      await matchTicket
        .connect(owner)
        .listMatch(
          "América de Cali vs Deportivo Cali",
          hre.ethers.parseEther("1"),
          1000,
          "2024-07-01",
          "20:00",
          "Estadio Olímpico Pascual Guerrero",
        );

      const matchDetails = await matchTicket.getMatch(1);

      expect(matchDetails.cost).to.equal(hre.ethers.parseEther("1"));
    });

    it("Should fail to list a match if max tickets exceed limit", async function () {
      const { matchTicket, owner } = await deployMatchTicketFixture();

      await expect(
        matchTicket
          .connect(owner)
          .listMatch(
            "Partido inválido",
            hre.ethers.parseEther("1"),
            40000,
            "2024-07-01",
            "20:00",
            "Estadio Olímpico Pascual Guerrero",
          ),
      ).to.be.revertedWith("Cannot exceed stadium capacity");
    });
  });
});
