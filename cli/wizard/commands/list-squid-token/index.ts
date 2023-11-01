import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { $, fs, path, spinner } from "zx";

import {
  InterchainTokenConfig,
  InterchainTokenListConfig,
} from "../../../schemas/interchain-tokenlist";
import { address, hash } from "../../../schemas/common";
import { patchConfig } from "../../utils";

const BASE_REPO_URL =
  "https://raw.githubusercontent.com/axelarnetwork/public-chain-configs";

export async function listSquidToken() {
  console.log(chalk.blue("\nGenerating token listing config...\n"));

  const didRegisterViaPortal = await confirm({
    message: "Did you register your token via ITS portal?",
    default: false,
  });

  if (!didRegisterViaPortal) {
    console.log(
      chalk.red(
        "\nPlease register your token via ITS portal before continuing\n"
      )
    );
    process.exit(1);
  }

  const tokenDetailsUrl = await input({
    message:
      "What is the URL of your token details? (e.g: https://interchain.axelar.dev/avalanche/0x1234)",
  }).then((url) => url.trim());

  const environment = getEnvironmentFromUrl(tokenDetailsUrl);

  const [, tokenAddress] = tokenDetailsUrl.match(/\/(0x([0-9a-f]+))$/i) ?? [];

  const baseUrl = tokenDetailsUrl.match(/^(https?:\/\/[^\/]+)/i)?.[1];

  const searchApiUrl = `${baseUrl}/api/interchain-token/search?tokenAddress=${tokenAddress}`;

  const searchResult = await spinner(
    `Searching ${environment} token...`,
    () =>
      fetch(searchApiUrl)
        .then((res) => res.json())
        .catch(() => ({})) as Promise<InterchainTokenSearchResult>
  );

  const detailsApiUrl = `${baseUrl}/api/interchain-token/details?tokenAddress=${tokenAddress}&chainId=${searchResult.chainId}`;

  const tokenDetails = await spinner(
    `Fetching ${environment} token details...`,
    () =>
      fetch(detailsApiUrl)
        .then((res) => res.json())
        .catch(() => ({})) as Promise<InterchainTokenDetails>
  );

  const newTokenConfig = parseAsInterchainTokenConfig(tokenDetails);

  console.log("Here is your interchain token config:\n");
  console.log(JSON.stringify(newTokenConfig, null, 2));

  const relativePath = [
    "registry",
    environment,
    "interchain",
    "squid.tokenlist.json",
  ];

  await patchConfig<InterchainTokenListConfig, InterchainTokenListConfig>(
    relativePath,
    {
      tokens: (tokens) => [...(tokens ?? []), newTokenConfig],
    },
    {
      isDuplicate: (config) =>
        config.tokens.some(
          (token) =>
            token.tokenAddress === newTokenConfig.tokenAddress ||
            token.tokenId === newTokenConfig.tokenId
        ),
      transformConfig: (config) => ({
        ...config,
        tokens: [...config.tokens, newTokenConfig],
      }),
    }
  );

  // create a placeholder svg file for the token icon under images/tokens/{tokenSymbol}.svg, copy the svg content from tokens/axl.svg
  const tokenIconPath = path.resolve(
    process.cwd(),
    "images",
    "tokens",
    `${newTokenConfig.symbol.toLowerCase()}.svg`
  );
  const tokenIconContent = await fs.readFile(
    path.resolve(process.cwd(), "images", "tokens", "axl.svg"),
    "utf-8"
  );
  await fs.writeFile(tokenIconPath, tokenIconContent);

  console.log(chalk.bold.green("\nConfig saved!\n"));

  const shouldCreatePR = await confirm({
    message: "Would you like to create a PR?",
    default: false,
  });

  if (!shouldCreatePR) {
    console.log(chalk.bold.green("\nGoodbye!\n"));
    process.exit(0);
  }

  const tokenListPath = path.resolve(process.cwd(), ...relativePath);

  await spinner("Creating PR...", async () => {
    await $`git checkout -b feat/add-${newTokenConfig.symbol}-token`;
    await $`git add ${tokenListPath}`;
    await $`git commit -m "feat: add ${newTokenConfig.symbol} token"`;
    await $`git push -u origin HEAD`;
  });
}

export type InterchainTokenInfo = {
  tokenId: string;
  tokenAddress: string;
  isOriginToken: boolean;
  isRegistered: boolean;
  chainId: number;
  axelarChainId: string;
  chainName: string;
  wasDeployedByAccount?: boolean;
  kind: "canonical" | "standardized";
};

export type InterchainTokenSearchResult = InterchainTokenInfo & {
  matchingTokens: InterchainTokenInfo[];
};

export type RemoteInterchainToken = {
  chainId: number;
  axelarChainId: string;
  address: string;
  deploymentStatus: string;
  deploymentTxHash: string;
};

export type InterchainTokenDetails = {
  kind: string;
  salt: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  chainId: number;
  axelarChainId: string;
  tokenId: string;
  deploymentTxHash: string;
  deployerAddress: string;
  remoteTokens: RemoteInterchainToken[];
};

function parseAsInterchainTokenConfig(
  data: InterchainTokenDetails
): InterchainTokenConfig {
  return {
    tokenId: hash.parse(data.tokenId),
    tokenAddress: address.parse(data.tokenAddress),
    symbol: data.tokenSymbol,
    prettySymbol: data.tokenSymbol,
    decimals: data.tokenDecimals,
    name: data.tokenName,
    originChainId: String(data.chainId),
    originAxelarChainId: data.axelarChainId,
    transferType: data.kind,
    iconUrls: {
      svg: `${BASE_REPO_URL}/images/tokens/${data.tokenSymbol.toLowerCase()}.svg`,
    },
    remoteTokens: data.remoteTokens.map((token) => ({
      axelarChainId: token.axelarChainId,
      chainId: String(token.chainId),
      tokenAddress: address.parse(token.address),
    })),
  };
}

function getEnvironmentFromUrl(tokenDetailsUrl: string) {
  return tokenDetailsUrl.startsWith("https://interchain.axelar.dev")
    ? "mainnet"
    : "testnet";
}
