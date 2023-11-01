import { EVMChainConfig } from "../../../schemas/evm-chain";
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

  const file = await fs.readFile(resolvedPath, "utf-8").catch(() => null);

  // create file if it doesn't exist
  if (!file) {
    await fs.writeFile(resolvedPath, JSON.stringify({}, null, 2));
  }

  await patchConfig(relativePath, draftConfig, {
    isDuplicate: (config) => config.chainId === draftConfig.chainId,
    transformConfig(config): EVMChainConfig {
      return {
        $schema: "../../schemas/evm-chain.schema.json",
        id: parseInt(String(config.chainId)), // Assuming the 'chainId' can be converted to a number
        network: String(config.network),
        name: String(config.chainName),
        nativeCurrency: {
          name: String(config.nativeCurrencyName),
          symbol: String(config.nativeCurrencySymbol),
          decimals: parseInt(String(config.nativeCurrencyDecimals)), // Assuming this is always a valid integer
          iconUrl: "/images/tokens/eth.svg", // This is a placeholder, adjust if needed
        },
        rpcUrls: [String(config.rpcUrl)],
        blockExplorers: [
          {
            name: String(config.blockExplorerName),
            url: String(config.blockExplorerUrl),
          },
        ],
        iconUrl: "/images/chains/ethereum.svg", // This is a placeholder, adjust if needed
        testnet: String(config.configKind)?.toLowerCase() === "testnet",
      };
    },
  });
}
