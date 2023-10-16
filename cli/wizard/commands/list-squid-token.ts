import { input } from "@inquirer/prompts";
import chalk from "chalk";
import {
  InterchainTokenConfig,
  InterchainTokenListConfig,
} from "../../schemas/interchain-tokenlist";
import { address, hash } from "../../schemas/common";
import { $, fs, path, spinner } from "zx";

export async function listSquidToken() {
  console.log(chalk.blue("\nGenerating token listing config...\n"));

  const didRegisterViaPortal = await input({
    message: "Did you register your token via ITS portal? [yN]",
  }).then((answer) => answer.toLowerCase() === "y");

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

  const tokenConfig = parseAsInterchainTokenConfig(tokenDetails);

  console.log("Here is your interchain token config:\n");
  console.log(JSON.stringify(tokenConfig, null, 2));

  const filePath = [environment, "interchain", "squid.tokenlist.json"];

  const shouldWriteToConfigFile = await input({
    message: `Would you like to save this config to '${filePath.join(
      "/"
    )}'? [yN]`,
  }).then((answer) => answer.toLowerCase() === "y");

  if (!shouldWriteToConfigFile) {
    console.log(chalk.bold.green("\nGoodbye!\n"));
    process.exit(0);
  }

  const tokenListPath = path.resolve(
    process.cwd(),
    "registry",
    environment,
    "interchain",
    "squid.tokenlist.json"
  );
  const tokenList = await fs.readFile(tokenListPath, "utf-8");
  const tokenListConfig = JSON.parse(tokenList) as InterchainTokenListConfig;

  // check if token already exists in tokenlist

  const tokenExists = tokenListConfig.tokens.some(
    (token: InterchainTokenConfig) =>
      token.tokenAddress === tokenConfig.tokenAddress ||
      token.tokenId === tokenConfig.tokenId
  );

  if (tokenExists) {
    console.log(
      chalk.red(
        "\nThis token already exists in the tokenlist. Please check the tokenlist and try again.\n"
      )
    );
    process.exit(1);
  }

  console.log(chalk.blue("\nGenerating token listing config...\n"));

  const nextTokenListConfig = {
    ...tokenListConfig,
    tokens: [...tokenListConfig.tokens, tokenConfig],
  };

  await fs.writeFile(
    tokenListPath,
    JSON.stringify(nextTokenListConfig, null, 2)
  );

  console.log(chalk.bold.green("\nConfig saved!\n"));

  const shouldCreatePR = await input({
    message: "Would you like to create a PR? [yN]",
    default: "N",
  })
    .then((answer) => answer.toLowerCase() === "y")
    .catch(() => false);

  if (shouldCreatePR) {
    await spinner("Creating PR...", async () => {
      await $`git checkout -b feat/add-${tokenConfig.symbol}-token`;
      await $`git add ${tokenListPath}`;
      await $`git commit -m "feat: add ${tokenConfig.symbol} token"`;
      await $`git push -u origin HEAD`;
    });
  }
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
      svg: "",
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
