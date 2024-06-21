// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Ticket is ERC721, Ownable {
  uint256 private _tokenIdCounter;
  uint256 public ticketPrice = 1 ether;
  uint256 public constant MAX_TICKETS = 37899;
  uint256 public ticketsForSale = MAX_TICKETS;

  constructor() ERC721("Ticket", "TICKET") {}

  function mintTicket(address to) public onlyOwner {
    require(
      _tokenIdCounter < ticketsForSale,
      "All available tickets have been minted"
    );
    _safeMint(to, _tokenIdCounter);
    _tokenIdCounter++;
  }

  function buyTicket() public payable {
    require(msg.value == ticketPrice, "Incorrect amount sent");
    mintTicket(msg.sender);
  }

  function setTicketPrice(uint256 price) public onlyOwner {
    ticketPrice = price;
  }

  function setTicketsForSale(uint256 tickets) public onlyOwner {
    require(tickets <= MAX_TICKETS, "Cannot exceed stadium capacity");
    ticketsForSale = tickets;
  }

  function withdraw() public onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }
}
