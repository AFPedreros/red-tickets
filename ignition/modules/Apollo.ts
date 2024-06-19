import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Apollo", (m: any) => {
  const apollo = m.contract("Rocket", ["Saturn V"]);

  m.call(apollo, "launch", []);

  return { apollo };
});
