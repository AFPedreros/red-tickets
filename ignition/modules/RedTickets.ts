import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RedTicketsModule = buildModule("RedTicketsModule", (m: any) => {
  const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const redTickets = m.contract("RedTickets", [initialOwner]);

  return { redTickets };
});

export default RedTicketsModule;
