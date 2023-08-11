import { input, select, checkbox } from "@inquirer/prompts";
import { z, ZodSchema } from "zod";

export const prettyPrint = <T extends Record<string, unknown>>(obj: T) =>
  JSON.stringify(obj, null, 2);

/**
 * Validates the input against the given zod schema.
 * @param schema
 * @returns true if the input is valid, otherwise an error message
 */
export const validateWith =
  <S extends ZodSchema>(schema: S) =>
  (input: unknown) => {
    try {
      schema.parse(input);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.message;
      }
      throw error;
    }
  };

export const validators = {
  nonEmpty: validateWith(z.string().nonempty("This field cannot be empty")),
  optionalString: validateWith(z.string().optional()),
  numeric: validateWith(
    z
      .number()
      .positive("This field must be a number")
      .gt(0, "This field must be a number greater than 0")
  ),
  url: validateWith(
    z.string().url("This field must be a valid URL (e.g. https://example.com)")
  ),
};

export const confirmPrompt = (draft: {}) =>
  select({
    message: `Is this correct? \n${prettyPrint(draft)}\n`,
    choices: [
      {
        name: "Yes",
        value: "true",
      },
      {
        name: "No",
        value: "false",
      },
      {
        name: "Cancel",
        value: "cancel",
      },
    ],
  }).then((value) => {
    if (value === "cancel") {
      process.exit(0);
    }
    return value === "true";
  });

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
      message: "What is the name of the native currency?",
      validate: validators.nonEmpty,
    }),
  nativeCurrencySymbol: () =>
    input({
      message: "What is the symbol of the native currency?",
      validate: validators.nonEmpty,
    }),
  nativeCurrencyDecimals: () =>
    input({
      message: "How many decimals does the native currency have?",
      validate: validators.numeric,
    }),
  rpcUrl: () =>
    input({
      message: "Provide the RPC URL:",
      validate: validators.url,
    }),
  blockExplorerName: () =>
    input({
      message: "Name of the block explorer?",
      validate: validators.nonEmpty,
    }),
  blockExplorerUrl: () =>
    input({
      message: "URL of the block explorer?",
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

export type DraftConfig = Record<string, string | string[]>;

export type EVMChainField = keyof typeof evmChainPrompts;

export type CosmosChainField = keyof typeof cosmosChainPrompts;
