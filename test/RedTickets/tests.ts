import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre from "hardhat";

import { MATCH_INFO, MAX_TICKETS } from "./constants";
import { deployMatchTicketFixture } from "./functions";

import { RedTickets } from "@/typechain-types";

describe("RedTickets", () => {
  let redTickets: RedTickets;
  let owner: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async () => {
    const fixture = await deployMatchTicketFixture();

    redTickets = fixture.matchTicket;
    owner = fixture.owner;
    otherAccount = fixture.otherAccount;
  });

  describe("Deployment", () => {
    it("Should set the right name", async () => {
      expect(await redTickets.name()).to.equal("RedTickets");
    });

    it("Should set the right symbol", async () => {
      expect(await redTickets.symbol()).to.equal("RTK");
    });

    it("Should set the right owner", async () => {
      expect(await redTickets.owner()).to.equal(owner.address);
    });

    it("Should set the max tickets correctly", async () => {
      expect(await redTickets.MAX_TICKETS()).to.equal(MAX_TICKETS);
    });
  });

  describe("Match Management", () => {
    describe("Success", () => {
      beforeEach(async () => {
        await redTickets
          .connect(owner)
          .listMatch(
            MATCH_INFO.name,
            MATCH_INFO.price,
            MATCH_INFO.tickets,
            MATCH_INFO.date,
            MATCH_INFO.time,
            MATCH_INFO.location,
          );
      });

      it("Should list a match correctly", async () => {
        const matchDetails = await redTickets.getMatch(1);

        expect(matchDetails.name).to.equal(MATCH_INFO.name);
        expect(matchDetails.price).to.equal(hre.ethers.parseEther("1"));
        expect(matchDetails.tickets).to.equal(MATCH_INFO.tickets);
        expect(matchDetails.date).to.equal(MATCH_INFO.date);
        expect(matchDetails.time).to.equal(MATCH_INFO.time);
        expect(matchDetails.location).to.equal(MATCH_INFO.location);
      });

      it("Should allow the owner to remove a match", async () => {
        await redTickets.connect(owner).removeMatch(1);

        const matchDetails = await redTickets.getMatch(1);

        expect(matchDetails.name).to.equal("");
      });

      it("Should allow the owner to update ticket price", async () => {
        await redTickets
          .connect(owner)
          .setTicketPrice(1, hre.ethers.parseEther("2"));

        const matchDetails = await redTickets.getMatch(1);

        expect(matchDetails.price).to.equal(hre.ethers.parseEther("2"));
      });

      it("Should allow the owner to update tickets for sale", async () => {
        await redTickets.connect(owner).setTicketsForSale(1, 100);

        const matchDetails = await redTickets.getMatch(1);

        expect(matchDetails.tickets).to.equal(100);
      });

      it("Should list multiple matches correctly", async () => {
        await redTickets
          .connect(owner)
          .listMatch(
            "Match 2",
            hre.ethers.parseEther("2"),
            2000,
            "2024-07-03",
            "18:00",
            "Stadium 2",
          );
        await redTickets
          .connect(owner)
          .listMatch(
            "Match 3",
            hre.ethers.parseEther("3"),
            3000,
            "2024-07-04",
            "20:00",
            "Stadium 3",
          );

        const matchDetails2 = await redTickets.getMatch(2);
        const matchDetails3 = await redTickets.getMatch(3);

        expect(matchDetails2.name).to.equal("Match 2");
        expect(matchDetails3.name).to.equal("Match 3");
      });
    });

    describe("Failure", () => {
      it("Should fail to list a match if max tickets exceed limit", async () => {
        await expect(
          redTickets
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

      it("Should fail to list a match if not the owner", async () => {
        await expect(
          redTickets
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
            redTickets,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(otherAccount.address);
      });

      it("Should fail to remove a match if match does not exist", async () => {
        await expect(
          redTickets.connect(owner).removeMatch(1),
        ).to.be.revertedWith("Invalid match ID");
      });

      it("Should fail if the ticket amount is already sold", async () => {
        await redTickets
          .connect(owner)
          .listMatch(
            "Match 4",
            hre.ethers.parseEther("1"),
            100,
            "2024-07-05",
            "17:00",
            "Stadium 4",
          );
        await redTickets
          .connect(otherAccount)
          .mintTicket(1, 1, { value: hre.ethers.parseEther("1") });

        await expect(
          redTickets.connect(owner).setTicketsForSale(1, 0),
        ).to.be.revertedWith("Cannot set less tickets than already sold");
      });
      describe("When not the owner", () => {
        beforeEach(async () => {
          await redTickets
            .connect(owner)
            .listMatch(
              MATCH_INFO.name,
              MATCH_INFO.price,
              MATCH_INFO.tickets,
              MATCH_INFO.date,
              MATCH_INFO.time,
              MATCH_INFO.location,
            );
        });

        it("Should fail to remove a match", async () => {
          await expect(redTickets.connect(otherAccount).removeMatch(1))
            .to.be.revertedWithCustomError(
              redTickets,
              "OwnableUnauthorizedAccount",
            )
            .withArgs(otherAccount.address);
        });

        it("Should fail to update ticket price", async () => {
          await expect(
            redTickets
              .connect(otherAccount)
              .setTicketPrice(1, hre.ethers.parseEther("2")),
          )
            .to.be.revertedWithCustomError(
              redTickets,
              "OwnableUnauthorizedAccount",
            )
            .withArgs(otherAccount.address);
        });

        it("Should fail to update tickets for sale", async () => {
          await expect(
            redTickets.connect(otherAccount).setTicketsForSale(1, 100),
          )
            .to.be.revertedWithCustomError(
              redTickets,
              "OwnableUnauthorizedAccount",
            )
            .withArgs(otherAccount.address);
        });
      });
    });
  });

  describe("Ticket Purchase", () => {
    beforeEach(async () => {
      await redTickets
        .connect(owner)
        .listMatch(
          MATCH_INFO.name,
          hre.ethers.parseEther("1"),
          MATCH_INFO.tickets,
          MATCH_INFO.date,
          MATCH_INFO.time,
          MATCH_INFO.location,
        );
    });

    describe("Success", () => {
      it("Should allow a user to buy a ticket", async () => {
        await redTickets
          .connect(otherAccount)
          .mintTicket(1, 1, { value: hre.ethers.parseEther("1") });

        const matchDetails = await redTickets.getMatch(1);
        const seatOwner = await redTickets.seatTaken(1, 1);
        const totalSupply = await redTickets.totalSupply();

        expect(matchDetails.tickets).to.equal(MATCH_INFO.tickets - 1);
        expect(seatOwner).to.equal(otherAccount.address);
        expect(totalSupply).to.equal(1);
      });

      it("Should increase contract balance correctly after multiple purchases", async () => {
        await redTickets
          .connect(owner)
          .listMatch(
            "Match 4",
            hre.ethers.parseEther("1"),
            100,
            "2024-07-05",
            "17:00",
            "Stadium 4",
          );

        const contractBalanceBefore = await hre.ethers.provider.getBalance(
          redTickets.getAddress(),
        );

        await redTickets
          .connect(otherAccount)
          .mintTicket(1, 2, { value: hre.ethers.parseEther("1") });
        await redTickets
          .connect(otherAccount)
          .mintTicket(1, 3, { value: hre.ethers.parseEther("1") });

        const contractBalanceAfter = await hre.ethers.provider.getBalance(
          redTickets.getAddress(),
        );

        expect(contractBalanceAfter).to.equal(
          contractBalanceBefore + hre.ethers.parseEther("2"),
        );
      });

      // it("Should emit events correctly on match listing and ticket purchase", async () => {
      //   await expect(
      //     redTickets
      //       .connect(owner)
      //       .listMatch(
      //         "Match 5",
      //         hre.ethers.parseEther("1"),
      //         1000,
      //         "2024-07-06",
      //         "19:00",
      //         "Stadium 5",
      //       ),
      //   )
      //     .to.emit(redTickets, "MatchListed")
      //     .withArgs(
      //       5,
      //       "Match 5",
      //       hre.ethers.parseEther("1"),
      //       1000,
      //       "2024-07-06",
      //       "19:00",
      //       "Stadium 5",
      //     );

      //   await expect(
      //     redTickets
      //       .connect(otherAccount)
      //       .mintTicket(5, 1, { value: hre.ethers.parseEther("1") }),
      //   )
      //     .to.emit(redTickets, "TicketMinted")
      //     .withArgs(otherAccount.address, 5, 1);
      // });
    });

    describe("Failure", () => {
      it("Should fail if match does not exist", async () => {
        await expect(
          redTickets
            .connect(otherAccount)
            .mintTicket(2, 1, { value: hre.ethers.parseEther("1") }),
        ).to.be.revertedWith("Invalid match ID");
      });

      it("Should fail if incorrect amount sent", async () => {
        await expect(
          redTickets
            .connect(otherAccount)
            .mintTicket(1, 1, { value: hre.ethers.parseEther("0.5") }),
        ).to.be.revertedWith("Incorrect amount sent");
      });

      it("Should fail if seat is already taken", async () => {
        await redTickets
          .connect(otherAccount)
          .mintTicket(1, 1, { value: hre.ethers.parseEther("1") });

        await expect(
          redTickets
            .connect(owner)
            .mintTicket(1, 1, { value: hre.ethers.parseEther("1") }),
        ).to.be.revertedWith("Seat already taken");
      });

      it("Should fail if seat number is invalid", async () => {
        await expect(
          redTickets
            .connect(otherAccount)
            .mintTicket(1, 40000, { value: hre.ethers.parseEther("1") }),
        ).to.be.revertedWith("Invalid seat number");
      });
    });
  });

  describe("Withdrawal", () => {
    beforeEach(async () => {
      await redTickets
        .connect(owner)
        .listMatch(
          MATCH_INFO.name,
          hre.ethers.parseEther("1"),
          MATCH_INFO.tickets,
          MATCH_INFO.date,
          MATCH_INFO.time,
          MATCH_INFO.location,
        );

      await redTickets
        .connect(otherAccount)
        .mintTicket(1, 1, { value: hre.ethers.parseEther("1") });
    });

    it("Should allow the owner to withdraw funds", async () => {
      const ownerBalanceBefore = await hre.ethers.provider.getBalance(
        owner.address,
      );

      await redTickets.connect(owner).withdraw();
      const ownerBalanceAfter = await hre.ethers.provider.getBalance(
        owner.address,
      );

      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("Should fail if not the owner tries to withdraw", async () => {
      await expect(redTickets.connect(otherAccount).withdraw())
        .to.be.revertedWithCustomError(redTickets, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });
});
