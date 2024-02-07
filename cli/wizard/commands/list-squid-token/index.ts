import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { $, fs, path, spinner } from "zx";
import { convertCase } from "@axelarjs/utils";

import {
  InterchainTokenConfig,
  InterchainTokenListConfig,
} from "../../../schemas/interchain-tokenlist";
import { address, hash } from "../../../schemas/common";
import { patchConfig } from "../../utils";

const BASE_REPO_URL =
  "https://raw.githubusercontent.com/axelarnetwork/axelar-configs";

export async function listSquidToken() {
  console.log(chalk.blue("\nGenerating token listing config...\n"));

  const didFork = await confirm({
    message:
      "Are you running this wizard from a forked repository in your own Github organization?",
    default: false,
  });

  if (!didFork) {
    console.log(chalk.red("\nPlease fork this repository before continuing\n"));
    process.exit(1);
  }

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
        .catch(() => ({})) as Promise<InterchainTokenDetailsApiResponse>
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
      tokens: (tokens) => ({
        ...tokens,
        [newTokenConfig.tokenId]: newTokenConfig,
      }),
    },
    {
      isDuplicate: (config) =>
        config.tokens[newTokenConfig.tokenId] !== undefined,
    }
  );

  // create a placeholder svg file for the token icon under images/tokens/{tokenSymbol}.svg, copy the svg content from tokens/axl.svg
  const tokenIconPath = path.resolve(
    process.cwd(),
    "images",
    "tokens",
    `${newTokenConfig.prettySymbol.toLowerCase()}.svg`
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
    await $`git checkout -b feat/add-${newTokenConfig.prettySymbol}-token`;
    await $`git add ${tokenListPath}`;
    await $`git commit -m "feat: add ${newTokenConfig.prettySymbol} token"`;
    await $`git push -u origin HEAD`;
  });
}

export type InterchainTokenInfoBaseAPIResponse = {
  tokenId: string;
  tokenAddress: string;
  tokenManagerAddress: string;
  tokenManagerType: string;
  isOriginToken: boolean;
  isRegistered: boolean;
  chainId: number;
  axelarChainId: string;
  chainName: string;
  wasDeployedByAccount?: boolean;
  kind: "canonical" | "interchain" | "customInterchain";
};

export type InterchainTokenSearchResult = InterchainTokenInfoBaseAPIResponse & {
  matchingTokens: InterchainTokenInfoBaseAPIResponse[];
};

export type RemoteInterchainTokenApiResponse = {
  name: string;
  symbol: string;
  axelarChainId: string;
  tokenAddress: string;
  tokenManagerAddress: string;
  tokenManagerType: string;
  deploymentStatus: string;
  deploymentMessageId: string;
};

export type InterchainTokenDetailsApiResponse = {
  kind: string;
  salt: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  tokenManagerAddress: string;
  tokenManagerType: string;
  originalMinterAddress: string;
  axelarChainId: string;
  tokenId: string;
  deploymentMessageId: string;
  deployerAddress: string;
  remoteTokens: RemoteInterchainTokenApiResponse[];
};

function parseAsInterchainTokenConfig(
  data: InterchainTokenDetailsApiResponse
): InterchainTokenConfig {
  return {
    tokenId: hash.parse(data.tokenId),
    deployer: data.deployerAddress,
    originalMinter: data.originalMinterAddress,
    prettySymbol: data.tokenSymbol,
    decimals: data.tokenDecimals,
    originAxelarChainId: data.axelarChainId,
    tokenType: data.kind,
    deploySalt: data.salt,
    iconUrls: {
      svg: `${BASE_REPO_URL}/images/tokens/${data.tokenSymbol.toLowerCase()}.svg`,
    },
    deploymentMessageId: data.deploymentMessageId ?? "",
    chains: [
      ...[
        {
          symbol: data.tokenSymbol,
          name: data.tokenName,
          axelarChainId: data.axelarChainId,
          tokenAddress: address.parse(data.tokenAddress),
          tokenManager: address.parse(data.tokenManagerAddress),
          tokenManagerType: convertToCamelCase(data.tokenManagerType),
        },
      ],
      ...data.remoteTokens.map((token) => ({
        symbol: data.tokenSymbol,
        name: data.tokenName,
        axelarChainId: token.axelarChainId,
        tokenAddress: address.parse(token.tokenAddress),
        tokenManager: address.parse(token.tokenManagerAddress),
        tokenManagerType: convertToCamelCase(token.tokenManagerType),
      })),
    ],
  };
}

function getEnvironmentFromUrl(tokenDetailsUrl: string) {
  return tokenDetailsUrl?.includes("testnet") ? "testnet" : "mainnet";
}

function convertToCamelCase(input: string) {
  return convertCase("CONSTANT_CASE", "camelCase")(input ?? "unknown");
}
