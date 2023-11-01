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
      const currencySymbol = String(config.nativeCurrencySymbol);
      const chainName = String(config.chainName);

      return {
        $schema: "../../schemas/evm-chain.schema.json",
        id: parseInt(String(config.chainId)),
        network: String(config.network),
        name: chainName,
        nativeCurrency: {
          name: String(config.nativeCurrencyName),
          symbol: currencySymbol,
          decimals: parseInt(String(config.nativeCurrencyDecimals)),
          iconUrl: `/images/tokens/${currencySymbol.toLowerCase()}.svg`,
        },
        rpcUrls: [String(config.rpcUrl)],
        blockExplorers: [
          {
            name: String(config.blockExplorerName),
            url: String(config.blockExplorerUrl),
          },
        ],
        iconUrl: `/images/chains/${chainName.toLowerCase()}.svg`,
        testnet: String(config.configKind)?.toLowerCase() === "testnet",
      };
    },
  });
}
