import { z } from "zod";
import { address, hash } from "./common";

export const IconUrlsSchema = z.object({
  svg: z.string().url(),
});

export const remoteToken = z.object({
  chain_id: z.string(),
  axelar_chain_id: z.string(),
  token_address: address,
});

export const interchainToken = z.object({
  token_id: hash,
  token_address: address,
  symbol: z.string(),
  pretty_symbol: z.string(),
  decimals: z.number().int(),
  name: z.string(),
  origin_chain_id: z.string(),
  origin_axelar_chain_id: z.string(),
  transfer_type: z.string(),
  iconUrls: IconUrlsSchema,
  remote_tokens: z.array(remoteToken),
});

const interchainTokenList = z.object({
  $schema: z.string().regex(/^(?:\.\.\/)+interchain-tokenlist\.schema\.json$/),
  version: z.string(),
  items: z.array(interchainToken),
});

export default interchainTokenList;

export type InterchainTokenConfig = z.infer<typeof interchainToken>;
