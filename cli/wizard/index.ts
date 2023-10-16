import { select } from "@inquirer/prompts";
import chalk from "chalk";

import { listSquidToken } from "./commands/list-squid-token";
import { addEvmChain } from "./commands/add-evm-chain";
import { addCosmosChain } from "./commands/add-cosmos-chain";

console.log(chalk.bold.green("\nWelcome to the Axelar config wizard!\n"));

const configType = await select({
  message: "What config would you like to generate?",
  choices: [
    {
      name: "List an interchain token on Squid",
      description:
        "Generates a config for listing an interchain token on Squid",
      value: "list-squid-token" as const,
    },
    {
      name: "EVM chain",
      description: "Generates a config for an EVM compatible chain",
      value: "evm-chain" as const,
    },
    {
      name: "Cosmos chain",
      description: "Generates a config for a Cosmos compatible chain",
      value: "cosmos-chain" as const,
    },
    {
      name: "EVM Assetlist",
      description: "Generates an assetlist for an EVM compatible chain",
      value: "evm-assetlist" as const,
    },
    {
      name: "Cosmos Assetlist",
      description: "Generates an assetlist for a Cosmos compatible chain",
      value: "cosmos-assetlist" as const,
    },
    {
      name: "N/A",
      description: "Exit the wizard",
      value: "none" as const,
    },
  ],
});

switch (configType) {
  case "evm-chain":
    await addEvmChain();
    break;
  case "cosmos-chain":
    await addCosmosChain();
    break;
  case "list-squid-token":
    await listSquidToken();
    break;
  case "none":
    console.log(chalk.bold.green("\nGoodbye!\n"));
    process.exit(0);
}
