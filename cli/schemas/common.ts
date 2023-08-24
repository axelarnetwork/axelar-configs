import { z } from "zod";

export const chainIconUrl = z
  .string()
  .regex(/\/images\/chains\/([a-z\-]+)\.svg$/)
  .describe(
    "the icon for the chain, must be a relative path to a svg icon under /images/chains"
  );

export const currencyIconUrl = z
  .string()
  .regex(/\/images\/tokens\/([a-z\-]+)\.svg$/)
  .describe(
    "the icon for the currency, must be a relative path to a svg icon under /images/tokens"
  );

export const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const hash = z.string().regex(/^0x[a-fA-F0-9]{64}$/);

export const baseChains = z.object({
  name: z.string().describe("the name of the chain list"),
  timestamp: z.string().describe("the timestamp of the last update"),
});
