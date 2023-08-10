import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { prettyPrint } from "./utils";

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

const prompts = {
  configKind: () =>
    select({
      message: "What kind of configuration is this?",
      choices: [
        {
          name: "Mainnet",
          value: "mainnet" as const,
        },
        {
          name: "Testnet",
          value: "testnet" as const,
        },
      ],
    }),
  chainName: () =>
    input({
      message: "What is the name of the chain?",
      validate: validators.nonEmpty,
    }),
};

switch (configType) {
  case "evm-chain":
    {
      const configKind = await prompts.configKind();

      const chainName = await prompts.chainName();

      const chainId = await input({
        message: "What is the chain ID?",
        validate: validators.numeric,
      });

      const draftConfig = {
        chainName,
        chainId,
        isTestnet: configKind === "testnet",
      };

      const confirm = await select({
        message: `Is this correct? \n${prettyPrint(draftConfig)}\n`,
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

      if (!confirm) {
        console.log(chalk.red("\nAborting...\n"));
        process.exit(0);
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
      const chainName = await input({
        message: "What is the name of the chain?",
        validate: validators.nonEmpty,
      });

      console.log(chalk.blue("\nGenerating Cosmos chain config...\n"));
    }
    break;
}
