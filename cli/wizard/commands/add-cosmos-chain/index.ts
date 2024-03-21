import { CosmosChainConfig } from "../../../schemas/cosmos-chain";
import {
  PromptsResult,
  buildChainConfig,
  cosmosChainPrompts,
} from "../../prompts";
import { defaultBech32Config, patchConfig, slugify } from "../../utils";

import { fs, path } from "zx";

type PromptResult = PromptsResult<typeof cosmosChainPrompts>;

export async function addCosmosChain() {
  const draftConfig = await buildChainConfig(cosmosChainPrompts);

  console.log(
    "Here is the draft config: ",
    JSON.stringify(draftConfig, null, 2)
  );

  const configFileName = slugify(String(draftConfig.chainName));

  const relativePath = [
    "registry",
    String(draftConfig.configKind),
    "cosmos",
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
    transformConfig: () => toJsonSchemaFormat(draftConfig as PromptResult),
  });
}

type Output = CosmosChainConfig & {
  $schema: string;
};

function toJsonSchemaFormat(draft: PromptResult): Output {
  const stakeCurrency = {
    coinDenom: draft.stakeCurrencySymbol,
    coinMinimalDenom: draft.stakeCurrencySymbol.toLowerCase(),
    coinDecimals: Number(draft.stakeCurrencyDecimals),
  };

  return {
    $schema: "../../schemas/cosmos-chain.schema.json",
    rpc: draft.rpc,
    rest: draft.rest,
    chainId: draft.chainId,
    bech32Config: defaultBech32Config(draft.bech32Prefix),
    chainName: draft.chainName,
    currencies: [stakeCurrency],
    feeCurrencies: [stakeCurrency],
    stakeCurrency: stakeCurrency,
    bip44: {
      coinType: Number(draft.bip44),
    },
    chainIconUrl: `/images/chains/${slugify(draft.chainName)}.svg`,
    features: draft.features as CosmosChainConfig["features"],
    walletUrlForStaking: draft.walletUrlForStaking,
  };
}
