import { input, select, checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import { confirmPrompt, defaultBech32Config, validators } from "./utils";

export const commonPrompts = {
  configKind: () =>
    select({
      message: "What environment is this config for?",
      choices: [
        {
          name: "Mainnet",
          value: "mainnet",
        },
        {
          name: "Testnet",
          value: "testnet",
        },
      ],
    }),
};

export const evmChainPrompts = {
  ...commonPrompts,
  chainName: () =>
    input({
      message: "What is the name of the chain?",
      validate: validators.nonEmpty,
    }),
  chainId: () =>
    input({
      message: "What is the chain ID?",
      validate: validators.numeric,
    }),
  network: () =>
    input({
      message: "What is the network?",
      validate: validators.nonEmpty,
    }),
  nativeCurrencyName: () =>
    input({
      message: `What's the ${chalk.yellow("name")} of the native currency?`,
      validate: validators.nonEmpty,
    }),
  nativeCurrencySymbol: () =>
    input({
      message: `What's the ${chalk.yellow("symbol")} of the native currency?`,
      validate: validators.nonEmpty,
    }),
  nativeCurrencyDecimals: () =>
    input({
      message: `How many ${chalk.yellow(
        "decimals"
      )} does the native currency have?`,
      default: "18",
      validate: validators.numeric,
    }),
  rpcUrl: () =>
    input({
      message: `Provide the ${chalk.yellow("RPC")} URL:`,
      validate: validators.url,
    }),
  blockExplorerName: () =>
    input({
      message: `Name of the ${chalk.yellow("block explorer")}?`,
      validate: validators.nonEmpty,
    }),
  blockExplorerUrl: () =>
    input({
      message: `Provide ${chalk.yellow("block explorer")} URL?`,
      validate: validators.url,
    }),
};

export const cosmosChainPrompts = {
  ...commonPrompts,
  rpc: () =>
    input({
      message: "What is the RPC endpoint of the chain?",
      validate: validators.url,
    }),
  rest: () =>
    input({
      message: "What is the REST endpoint of the chain?",
      validate: validators.url,
    }),
  chainId: () =>
    input({
      message: "What is the chain ID?",
      validate: validators.nonEmpty,
    }),
  chainName: () =>
    input({
      message: "What is the name of the chain?",
      validate: validators.nonEmpty,
    }),
  stakeCurrencyName: () =>
    input({
      message: "What is the name of the staking token?",
      validate: validators.nonEmpty,
    }),
  stakeCurrencySymbol: () =>
    input({
      message: "What is the symbol of the staking token?",
      validate: validators.nonEmpty,
    }),
  stakeCurrencyDecimals: () =>
    input({
      message: "How many decimals does the staking token have?",
      validate: validators.nonEmpty,
    }),
  walletUrlForStaking: () =>
    input({
      message: "What is the URL of the staking interface?",
      validate: validators.url,
    }),
  bip44: () =>
    input({
      message: "What is the BIP44 coinType?",
      validate: validators.nonEmpty,
    }),
  bech32Prefix: () =>
    input({
      message: "What is the Bech32 prefix?",
      validate: validators.nonEmpty,
    }),

  features: () =>
    checkbox({
      message: "What features does this chain support?",
      choices: [
        {
          name: "IBC transfers",
          value: "ibc-transfer",
        },
        {
          name: "Stargate",
          value: "stargate",
        },
        {
          name: "CosmWasm",
          value: "cosmwasm",
        },
        {
          name: "Authz",
          value: "authz",
        },
        {
          name: "Fee Grant",
          value: "fee_grant",
        },
      ],
    }),
};

export type DraftConfig<T extends string = string> = Partial<
  Record<T, string | string[] | undefined>
>;

type StringKeysOnly<T> = T extends string ? T : never;

type PromptMap<T extends string> = Record<T, () => Promise<string | string[]>>;

export type ChainConfigPropmts =
  | typeof evmChainPrompts
  | typeof cosmosChainPrompts;

export type Unfold<T> = T extends Promise<infer U> ? U : T;

export type PromptsResult<T extends PromptMap<string>> = {
  [K in keyof T]: Unfold<ReturnType<T[K]>>;
};

export type CommonPromptsResult = PromptsResult<typeof commonPrompts>;

export type EVMChainPromptsResult = CommonPromptsResult &
  PromptsResult<typeof evmChainPrompts>;

export type CosmosChainPromptsResult = CommonPromptsResult &
  PromptsResult<typeof cosmosChainPrompts>;

/**
 * Builds a chain config interactively.
 * @param prompts
 * @returns a chain config
 */
export async function buildChainConfig<T extends ChainConfigPropmts>(
  prompts: T
) {
  return buildConfigInquiry(prompts);
}

/**
 * Builds a config interactively.
 *
 * @param prompts
 * @returns a config
 */
async function buildConfigInquiry<
  P extends PromptMap<string>,
  F extends string = StringKeysOnly<keyof P>
>(prompts: P): Promise<DraftConfig<F>> {
  const draft: DraftConfig<F> = {};

  for (const [field, prompt] of Object.entries(prompts)) {
    draft[field as F] = await prompt();
  }

  let confirm = await confirmPrompt(draft);

  while (!confirm) {
    const field = await select({
      message: "Which field would you like to change?",
      choices: Object.keys(draft).map((key) => ({
        name: key,
        value: key,
      })),
    });

    const prompt = prompts[field];

    draft[field as F] = await prompt();

    confirm = await confirmPrompt(draft);
  }

  return draft;
}
