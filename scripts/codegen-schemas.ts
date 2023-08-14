import { zodToJsonSchema } from "zod-to-json-schema";
import prettier from "prettier";
import { spinner } from "zx";

import fs from "fs/promises";

import * as evmDefinitions from "../cli/schemas/evm-chain";
import * as cosmosDefinitions from "../cli/schemas/cosmos-chain";

const TIMER_LABEL = "Finised generating JSON schemas 🎉";

console.time(TIMER_LABEL);

const inputs = [
  [evmDefinitions, "evm-chain"] as const,
  [cosmosDefinitions, "cosmos-chain"] as const,
];

await spinner(
  "Generating JSON schemas... ⏳",
  async () =>
    await Promise.all(
      inputs.map(async ([definitions, fileName]) => {
        const { $schema, ...schema } = zodToJsonSchema(definitions.chain, {
          definitions,
        });

        const fileContent = prettier.format(
          JSON.stringify({
            $schema,
            title: `${fileName} schema`,
            ...schema,
          }),
          { parser: "json" }
        );

        return fs.writeFile(
          `registry/schemas/${fileName}.schema.json`,
          fileContent
        );
      })
    )
);

console.timeEnd(TIMER_LABEL);
