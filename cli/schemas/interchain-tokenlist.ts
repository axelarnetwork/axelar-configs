import { z } from "zod";
import { address, hash } from "./common";

export const IconUrlsSchema = z.object({
  svg: z.string().url(),
});

export const remoteToken = z.object({
  chainId: z.string(),
  axelarChainId: z.string(),
  tokenAddress: address,
});

export const interchainToken = z.object({
  tokenId: hash,
  tokenAddress: address,
  symbol: z.string(),
  prettySymbol: z.string(),
  decimals: z.number().int(),
  name: z.string(),
  originChainId: z.string(),
  originAxelarChainId: z.string(),
  transferType: z.string(),
  iconUrls: IconUrlsSchema,
  remoteTokens: z.array(remoteToken),
  coinGeckoId: z.string().optional(),
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
  tokens: z.array(interchainToken),
});

export default interchainTokenList;

export type InterchainTokenConfig = z.infer<typeof interchainToken>;
