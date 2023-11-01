import { buildChainConfig, evmChainPrompts } from "../../prompts";
import { patchConfig, slugify } from "../../utils";

import { fs, path } from "zx";

export async function addEvmChain() {
  const draftConfig = await buildChainConfig(evmChainPrompts);

  console.log(
    "Here is the draft config: ",
    JSON.stringify(draftConfig, null, 2)
  );

  const configFileName = slugify(String(draftConfig.chainName));

  const relativePath = [
    "registry",
    String(draftConfig.configKind),
    "evm",
    `${configFileName}.chain.json`,
  ];

  const resolvedPath = path.resolve(process.cwd(), ...relativePath);

  const file = await fs.readFile(resolvedPath, "utf-8");

  // create file if it doesn't exist
  if (!file) {
    await fs.writeFile(resolvedPath, JSON.stringify({}, null, 2));
  }

  await patchConfig(relativePath, draftConfig, {
    isDuplicate: (config) => config.chainId === draftConfig.chainId,
    transformConfig: (config) => ({
      ...config,
      ...draftConfig,
    }),
  });

  // const shouldIncludeAssetlist = await select({
  //   message: "Would you like to generate an assetlist for this chain?",
  //   choices: [
  //     {
  //       name: "Yes",
  //       value: true,
  //     },
  //     {
  //       name: "No",
  //       value: false,
  //     },
  //   ],
  // });

  // console.log(chalk.blue("\nGenerating EVM chain config...\n"));

  // if (shouldIncludeAssetlist) {
  //   console.log(chalk.blue("\nGenerating EVM assetlist...\n"));
  // }
}
