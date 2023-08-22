import { zodToJsonSchema } from "zod-to-json-schema";
import prettier from "prettier";
import { globby, spinner, fs } from "zx";

const schemaFiles = await globby("cli/schemas/*.ts");

const validSchemaFiles = schemaFiles.filter(
  (fileName) => !fileName.includes("common")
);

const TIMER_LABEL = `Finished generating ${validSchemaFiles.length} JSON schemas 🎉`;

console.time(TIMER_LABEL);

const inputs = await Promise.all(
  validSchemaFiles.map(async (schemaFile) => {
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
