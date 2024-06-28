import { expect } from "chai";
import hre from "hardhat";

describe("Ticket", () => {
  async function deployTicketFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Ticket = await hre.ethers.getContractFactory("Ticket");
    const ticket = await Ticket.deploy(owner.address);

    return { ticket, owner, otherAccount };
  }

  describe("Deployment", () => {
    it("Should set the right owner", async function () {
      const { ticket, owner } = await deployTicketFixture();

      expect(await ticket.owner()).to.equal(owner.address);
    });
    it("Should set the initial ticket price to 1 ether", async function () {
      const { ticket } = await deployTicketFixture();

      expect(await ticket.ticketPrice()).to.equal(hre.ethers.parseEther("1"));
    });
  });
});
