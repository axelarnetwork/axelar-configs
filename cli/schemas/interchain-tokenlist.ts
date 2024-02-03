import { z } from "zod";
import { address, hash } from "./common";

export const IconUrlsSchema = z.object({
  svg: z.string().url(),
});

export const chains = z.object({
  axelarChainId: z.string(),
  tokenAddress: address,
  tokenManager: address,
  tokenManagerType: z.string(),
});

export const interchainToken = z.object({
  tokenId: hash,
  tokenAddress: address,
  tokenManager: address,
  deployer: address,
  originalMinter: address,
  tokenManagerType: z.string(),
  symbol: z.string(),
  prettySymbol: z.string(),
  decimals: z.number().int(),
  name: z.string(),
  originAxelarChainId: z.string(),
  tokenType: z.string(),
  iconUrls: IconUrlsSchema,
  salt: z.string(),
  chains: z.array(chains),
  coinGeckoId: z.string().optional(),
  deploymentTxHash: hash,
});

export const version = z.object({
  major: z.number().int(),
  minor: z.number().int(),
  patch: z.number().int(),
});

const interchainTokenList = z.object({
  $schema: z
    .string()
    .regex(/^(?:\.\.\/)+schemas\/interchain-tokenlist\.schema\.json$/),
  name: z.string(),
  version,
  tokens: z.record(z.string(), interchainToken),
});

export default interchainTokenList;

export type InterchainTokenListConfig = z.infer<typeof interchainTokenList>;

export type InterchainTokenConfig = z.infer<typeof interchainToken>;
