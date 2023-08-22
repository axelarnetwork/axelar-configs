import { input, select, checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import { confirmPrompt, validators } from "./utils";

export const commonPrompts = {
  configKind: () =>
    select({
      message: "What kind of configuration is this?",
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
      message: "What is the BIP44 path?",
      validate: validators.nonEmpty,
    }),
  bech32Config: () =>
    input({
      message: "What is the Bech32 config?",
      validate: validators.nonEmpty,
    }),
  bech32PrefixAccAddr: () =>
    input({
      message: "What is the Bech32 prefix for account addresses?",
      validate: validators.nonEmpty,
    }),
  bech32PrefixAccPub: () =>
    input({
      message: "What is the Bech32 prefix for account public keys?",
      validate: validators.nonEmpty,
    }),
  bech32PrefixValAddr: () =>
    input({
      message: "What is the Bech32 prefix for validator addresses?",
      validate: validators.nonEmpty,
    }),
  bech32PrefixValPub: () =>
    input({
      message: "What is the Bech32 prefix for validator public keys?",
      validate: validators.nonEmpty,
    }),
  bech32PrefixConsAddr: () =>
    input({
      message: "What is the Bech32 prefix for consensus addresses?",
      validate: validators.nonEmpty,
    }),
  bech32PrefixConsPub: () =>
    input({
      message: "What is the Bech32 prefix for consensus public keys?",
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
          name: "IBC go",
          value: "ibc-go",
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
          value: "feegrant",
        },
        {
          name: "No legacy stdTx support",
          value: "no-legacy-stdTx",
        },
      ],
    }),
};

export type DraftConfig<T extends string = string> = Partial<
  Record<T, string | string[]>
>;

export type ChainConfigPropmts =
  | typeof evmChainPrompts
  | typeof cosmosChainPrompts;

/**
 * Builds a chain config interactively.
 * @param prompts
 * @returns a chain config
 */
export async function buildChainConfig(prompts: ChainConfigPropmts) {
  type Field = keyof typeof prompts;

  const draft: DraftConfig<Field> = {};

  for (const [field, prompt] of Object.entries(prompts)) {
    draft[field as Field] = await prompt();
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

    const prompt = prompts[field as Field];
    draft[field as Field] = await prompt();

    confirm = await confirmPrompt(draft);
  }

  return draft;
}
