import { z } from "zod";
import chain from "./evm-chain";

const chains = z.object({
  $schema: z.string().regex(/^(?:\.\.\/)+schemas\/evm-chains\.schema\.json$/),
  timestamp: z.string(),
  chains: z.array(chain.omit({ $schema: true })),
});

export default chains;
