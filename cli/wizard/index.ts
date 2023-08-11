import { select } from "@inquirer/prompts";
import chalk from "chalk";
import {
  evmChainPrompts,
  cosmosChainPrompts,
  confirmPrompt,
  EVMChainField,
  CosmosChainField,
  DraftConfig,
} from "./utils";

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
  ],
});

const validators = {
  nonEmpty(input: string) {
    if (input.length === 0) {
      return "Please enter something";
    }
    return true;
  },
  numeric(input: string) {
    if (isNaN(Number(input))) {
      return "Please enter a number";
    }
    return true;
  },
};

switch (configType) {
  case "evm-chain":
    {
      const draftConfig: Record<string, string> = {};

      for (const [name, prompt] of Object.entries(evmChainPrompts)) {
        draftConfig[name] = await prompt();
      }

      let confirm = await confirmPrompt(draftConfig);

      while (!confirm) {
        // prompt to change field
        const targetField = await select({
          message: "Which field would you like to change?",
          choices: Object.entries(draftConfig).map(([name, value]) => ({
            name: `${name} (${chalk.cyan(value)})`,
            value: name as EVMChainField,
          })),
        });

        const prompt = evmChainPrompts[targetField];

        draftConfig[targetField] = await prompt();

        confirm = await confirmPrompt(draftConfig);
      }

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
      const draftConfig: DraftConfig = {};

      for (const [name, prompt] of Object.entries(cosmosChainPrompts)) {
        draftConfig[name] = await prompt();
      }

      let confirm = await confirmPrompt(draftConfig);

      while (!confirm) {
        // prompt to change field
        const targetField = await select({
          message: "Which field would you like to change?",
          choices: Object.entries(draftConfig).map(([name, value]) => ({
            name: `${name} (${chalk.cyan(value)})`,
            value: name as CosmosChainField,
          })),
        });

        const prompt = cosmosChainPrompts[targetField];

        draftConfig[targetField] = await prompt();

        confirm = await confirmPrompt(draftConfig);
      }

      console.log(chalk.blue("\nGenerating Cosmos chain config...\n"));
    }
    break;
}
