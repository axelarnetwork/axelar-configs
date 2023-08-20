import { zodToJsonSchema } from "zod-to-json-schema";
import prettier from "prettier";
import { globby, spinner } from "zx";

import fs from "fs/promises";

const schemaFiles = await globby("cli/schemas/*.ts");

const TIMER_LABEL = "Finished generating JSON schemas 🎉";

console.time(TIMER_LABEL);

const inputs = await Promise.all(
  schemaFiles
    .filter((fileName) => !fileName.includes("common"))
    .map(async (schemaFile) => {
      const fileName = schemaFile.match(/(?<=schemas\/).*(?=\.ts)/)?.[0];

      const { $schema, ...definitions } = await import(`../${schemaFile}`);

      return [definitions, fileName] as const;
    })
);

await spinner(
  "Generating JSON schemas... ⏳",
  async () =>
    await Promise.all(
      inputs.map(async ([{ default: main, ...definitions }, fileName]) => {
        const { $schema, ...schema } = zodToJsonSchema(main, { definitions });

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
