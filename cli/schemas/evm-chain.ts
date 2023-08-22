import { z } from "zod";

import { chainIconUrl, currencyIconUrl } from "./common";

export const blockExplorer = z
  .object({
    name: z.string(),
    url: z.string().url(),
  })
  .describe("a block explorer for the chain");

export const nativeCurrency = z
  .object({
    name: z.string(),
    symbol: z.string().min(2).max(6),
    decimals: z.number().int().min(0),
    iconUrl: currencyIconUrl,
  })
  .describe("the native currency for the chain");

export const rpcUrls = z
  .object({
    http: z.array(z.string().url()),
    webSocket: z.array(z.string().url()).optional(),
  })
  .describe("the RPC endpoints for the chain");

const chain = z
  .object({
    $schema: z.string().regex(/^(?:\.\.\/)+schemas\/evm-chain\.schema\.json$/),
    id: z.number().int(),
    name: z.string(),
    network: z.string(),
    nativeCurrency: nativeCurrency,
    rpcUrls: z.array(z.string().url()),
    blockExplorers: z.array(blockExplorer).optional(),
    testnet: z.boolean().optional(),
    iconUrl: chainIconUrl,
  })
  .describe("an EVM compatible chain configuration");

export default chain;

export type EVMChainConfig = z.infer<typeof chain>;
