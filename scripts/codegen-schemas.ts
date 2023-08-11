import { zodToJsonSchema } from "zod-to-json-schema";
import prettier from "prettier";
import { spinner } from "zx";

import fs from "fs/promises";

import * as evmDefinitions from "../cli/schemas/evm-chain";
import * as cosmosDefinitions from "../cli/schemas/cosmos-chain";

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

        return fs.writeFile(
          `registry/${fileName}.schema.json`,
          prettier.format(
            JSON.stringify({
              $schema,
              title: `${fileName} schema`,
              ...schema,
            }),
            { parser: "json" }
          )
        );
      })
    )
);

console.log("Done generating JSON schemas 🎉");
