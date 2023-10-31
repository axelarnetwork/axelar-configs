import { select } from "@inquirer/prompts";
import { buildChainConfig, evmChainPrompts } from "../../prompts";
import chalk from "chalk";

export async function addEvmChain() {
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
