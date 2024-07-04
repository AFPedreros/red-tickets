// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RedTickets is ERC721, Ownable {
  uint256 public totalMatches;
  uint256 public totalSupply;
  uint256 public constant MAX_TICKETS = 37899;

  struct Match {
    uint256 id;
    string name;
    uint256 price;
    uint256 tickets;
    uint256 maxTickets;
    string date;
    string time;
    string location;
  }

  mapping(uint256 => Match) public matches;
  mapping(uint256 => mapping(address => bool)) public hasBought;
  mapping(uint256 => mapping(uint256 => address)) public seatTaken;
  mapping(uint256 => uint256[]) public seatsTaken;

  constructor(
    address initialOwner
  ) ERC721("RedTickets", "RTK") Ownable(initialOwner) {}

  function listMatch(
    string memory _name,
    uint256 _price,
    uint256 _maxTickets,
    string memory _date,
    string memory _time,
    string memory _location
  ) public onlyOwner {
    require(_maxTickets <= MAX_TICKETS, "Cannot exceed stadium capacity");
    totalMatches++;
    matches[totalMatches] = Match(
      totalMatches,
      _name,
      _price,
      _maxTickets,
      _maxTickets,
      _date,
      _time,
      _location
    );
  }

  function removeMatch(uint256 _id) public onlyOwner {
    require(_id != 0 && _id <= totalMatches, "Invalid match ID");
    delete matches[_id];
  }

  function mintTicket(uint256 _id, uint256 _seat) public payable {
    require(_id != 0 && _id <= totalMatches, "Invalid match ID");
    require(msg.value >= matches[_id].price, "Incorrect amount sent");
    require(seatTaken[_id][_seat] == address(0), "Seat already taken");
    require(_seat <= matches[_id].maxTickets, "Invalid seat number");

    matches[_id].tickets -= 1;
    hasBought[_id][msg.sender] = true;
    seatTaken[_id][_seat] = msg.sender;
    seatsTaken[_id].push(_seat);

    totalSupply++;
    _safeMint(msg.sender, totalSupply);
  }

  function setTicketPrice(uint256 _id, uint256 _price) public onlyOwner {
    require(_id != 0 && _id <= totalMatches, "Invalid match ID");
    matches[_id].price = _price;
  }

  function setTicketsForSale(uint256 _id, uint256 _tickets) public onlyOwner {
    require(_id != 0 && _id <= totalMatches, "Invalid match ID");
    require(_tickets <= MAX_TICKETS, "Cannot exceed stadium capacity");
    require(
      _tickets >= matches[_id].maxTickets - matches[_id].tickets,
      "Cannot set less tickets than already sold"
    );
    matches[_id].tickets = _tickets;
  }

  function getMatch(uint256 _id) public view returns (Match memory) {
    return matches[_id];
  }

  function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
    return seatsTaken[_id];
  }

  function withdraw() public onlyOwner {
    (bool success, ) = owner().call{value: address(this).balance}("");
    require(success, "Withdrawal failed");
  }
}
