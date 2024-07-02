import { expect } from "chai";
import hre from "hardhat";

import { MATCH_INFO, MAX_TICKETS } from "./constants";
import { deployMatchTicketFixture } from "./functions";

describe("RedTickets", () => {
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
          MATCH_INFO.name,
          MATCH_INFO.price,
          MATCH_INFO.tickets,
          MATCH_INFO.date,
          MATCH_INFO.time,
          MATCH_INFO.location,
        );

      const matchDetails = await matchTicket.getMatch(1);

      expect(matchDetails.price).to.equal(hre.ethers.parseEther("1"));
    });

    it("Should fail to list a match if max tickets exceed limit", async function () {
      const { matchTicket, owner } = await deployMatchTicketFixture();

      await expect(
        matchTicket
          .connect(owner)
          .listMatch(
            "Partido inválido",
            MATCH_INFO.price,
            40000,
            MATCH_INFO.date,
            MATCH_INFO.time,
            MATCH_INFO.location,
          ),
      ).to.be.revertedWith("Cannot exceed stadium capacity");
    });

    it("Should fail to list a match if not the owner", async function () {
      const { matchTicket, otherAccount } = await deployMatchTicketFixture();

      await expect(
        matchTicket
          .connect(otherAccount)
          .listMatch(
            MATCH_INFO.name,
            MATCH_INFO.price,
            MATCH_INFO.tickets,
            MATCH_INFO.date,
            MATCH_INFO.time,
            MATCH_INFO.location,
          ),
      )
        .to.be.revertedWithCustomError(
          matchTicket,
          "OwnableUnauthorizedAccount",
        )
        .withArgs(otherAccount.address);
    });
  });
});
