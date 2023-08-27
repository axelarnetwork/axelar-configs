import { select } from "@inquirer/prompts";
import chalk from "chalk";
import {
  evmChainPrompts,
  cosmosChainPrompts,
  buildChainConfig,
} from "./prompts";

console.log(chalk.bold.green("\nWelcome to the Axelar config wizard!\n"));

const configType = await select({
  message: "What config would you like to generate?",
  choices: [
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
    {
      const draftConfig = await buildChainConfig(evmChainPrompts);

      console.log({
        draftConfig,
      });

      const shouldIncludeAssetlist = await select({
        message: "Would you like to generate an assetlist for this chain?",
        choices: [
          {
            name: "Yes",
            value: true,
          },
          {
            name: "No",
            value: false,
          },
        ],
      });

      console.log(chalk.blue("\nGenerating EVM chain config...\n"));

      if (shouldIncludeAssetlist) {
        console.log(chalk.blue("\nGenerating EVM assetlist...\n"));
      }
    }
    break;
  case "cosmos-chain":
    {
      const draftConfig = await buildChainConfig(cosmosChainPrompts);

      console.log({
        draftConfig,
      });

      console.log(chalk.blue("\nGenerating Cosmos chain config...\n"));
    }
    break;
  case "none":
    console.log(chalk.bold.green("\nGoodbye!\n"));
    process.exit(0);
}
