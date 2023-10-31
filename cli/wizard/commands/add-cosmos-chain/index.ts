import chalk from "chalk";
import { buildChainConfig, cosmosChainPrompts } from "../../prompts";

export async function addCosmosChain() {
  const draftConfig = await buildChainConfig(cosmosChainPrompts);

  console.log({
    draftConfig,
  });

  console.log(chalk.blue("\nGenerating Cosmos chain config...\n"));
}
