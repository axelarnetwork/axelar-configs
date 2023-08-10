import { z } from "zod";

import { chainIconUrl, currencyIconUrl } from "./common";

export const currency = z
  .object({
    coinDenom: z.string(),
    coinMinimalDenom: z.string(),
    coinDecimals: z.number(),
    coinGeckoId: z.string().optional(),
    coinImageUrl: currencyIconUrl.optional(),
  })
  .describe("a token on the chain");

export const bech32Config = z
  .object({
    bech32PrefixAccAddr: z.string(),
    bech32PrefixAccPub: z.string(),
    bech32PrefixValAddr: z.string(),
    bech32PrefixValPub: z.string(),
    bech32PrefixConsAddr: z.string(),
    bech32PrefixConsPub: z.string(),
  })
  .describe("the bech32 prefixes for the chain");

export const chain = z
  .object({
    $schema: z
      .string()
      .regex(/^(?:\.\.\/)+cosmos-chain\.schema\.json$/)
      .describe("the schema file for the chain"),
    rpc: z
      .string()
      .url()
      .describe("Address of RPC endpoint of the chain. Default port is 26657"),
    rest: z
      .string()
      .url()
      .describe(
        "Address of REST/API endpoint of the chain. Default port is 1317. Must be enabled in app.toml"
      ),
    chainId: z.string().describe("The unique identifier for the chain"),
    chainName: z.string().describe("The name of the chain"),
    stakeCurrency: currency.describe(
      "Information on the staking token of the chain"
    ),
    walletUrlForStaking: z
      .string()
      .url()
      .optional()
      .describe("The URL for the staking interface frontend for the chain"),
    bip44: z
      .object({
        coinType: z.number(),
      })
      .describe("BIP44 coin type for address derivation"),
    bech32Config: bech32Config.describe(
      "Bech32 config using the address prefix of the chain"
    ),
    currencies: z.array(currency).describe("List of currencies on the chain"),
    feeCurrencies: z
      .array(
        currency.and(
          z.object({
            gasPriceStep: z
              .object({
                low: z.number(),
                average: z.number(),
                high: z.number(),
              })
              .optional(),
          })
        )
      )
      .describe("List of fee tokens accepted by the chain's validator"),
    features: z
      .array(z.string())
      .optional()
      .describe("List of features supported by the chain"),
  })
  .describe("A Cosmos compatible chain configuration");
