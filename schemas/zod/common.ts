import { z } from "zod";

export const chainIconUrl = z
  .string()
  .regex(/\/images\/chains\/([a-z]+)\.svg$/)
  .describe(
    "the icon for the chain, must be a relative path to a svg icon under /images/chains"
  );

export const currencyIconUrl = z
  .string()
  .regex(/\/images\/tokens\/([a-z]+)\.svg$/)
  .describe(
    "the icon for the currency, must be a relative path to a svg icon under /images/tokens"
  );
