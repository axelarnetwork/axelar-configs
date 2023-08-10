import { zodToJsonSchema } from "zod-to-json-schema";
import prettier from "prettier";
import { spinner } from "zx";

import fs from "fs/promises";

import * as evmDefinitions from "../schemas/zod/evm-chain";
import * as cosmosDefinitions from "../schemas/zod/cosmos-chain";

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
          definitions: definitions,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

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

// with emoji
console.log("Done generating JSON schemas 🎉");
