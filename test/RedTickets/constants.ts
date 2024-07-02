import hre from "hardhat";

export const MAX_TICKETS = 37899;
export const MATCH_INFO = {
  name: "América de Cali vs Deportivo Cali",
  price: hre.ethers.parseEther("1"),
  tickets: 1000,
  date: "2024-07-01",
  time: "20:00",
  location: "Estadio Olímpico Pascual Guerrero",
};
