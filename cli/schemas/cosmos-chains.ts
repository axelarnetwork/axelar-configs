import { z } from "zod";
import chain from "./cosmos-chain";
import { baseChains } from "./common";

const chains = baseChains.and(
  z.object({
    $schema: z
      .string()
      .regex(/^(?:\.\.\/)+schemas\/cosmos-chains\.schema\.json$/),
    chains: z.array(chain.omit({ $schema: true })),
  })
);

export default chains;
