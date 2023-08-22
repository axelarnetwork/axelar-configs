import { z } from "zod";
import chain from "./evm-chain";
import { baseChains } from "./common";

const chains = baseChains.and(
  z.object({
    $schema: z.string().regex(/^(?:\.\.\/)+schemas\/evm-chains\.schema\.json$/),
    chains: z.array(chain.omit({ $schema: true })),
  })
);

export default chains;
