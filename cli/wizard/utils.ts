import { confirm, select } from "@inquirer/prompts";
import { z, ZodSchema } from "zod";
import { chalk, fs, path } from "zx";

export const prettyPrint = <T extends Record<string, unknown>>(obj: T) =>
  JSON.stringify(obj, null, 2);

export type Spec<T extends Record<string, unknown>> = {
  [K in keyof T]: (value: T[K]) => T[K];
};

export async function patchConfig<T extends Record<string, unknown>>(
  relativePath: string[],
  patch: Partial<T> | Spec<Partial<T>>,
  options: {
    isDuplicate(config: T): boolean;
    transformConfig(config: T): T;
  }
) {
  const shouldWriteToConfigFile = await confirm({
    message: `Would you like to save this config to \n './${relativePath.join(
      "/"
    )}'?`,
  });

  if (!shouldWriteToConfigFile) {
    console.log(chalk.bold.green("\nGoodbye!\n"));
    process.exit(0);
  }

  const configPath = path.resolve(process.cwd(), ...relativePath);
  const configContent = await fs.readFile(configPath, "utf-8");
  const config = JSON.parse(configContent) as T;

  const isDuplicate = options.isDuplicate(config);

  if (isDuplicate) {
    console.log(
      chalk.red(
        "\nThis config already exists. Please edit the existing config instead.\n"
      )
    );
    process.exit(1);
  }

  const patched = Object.entries(patch).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === "function" ? value(acc[key]) : value,
    }),
    config
  );

  const transformed = options.transformConfig(patched);

  console.log(chalk.blue("\nUpdating config file...\n"));

  await fs.writeFile(configPath, JSON.stringify(transformed, null, 2));
}
/**
 * Validates the input against the given zod schema.
 * @param schema
 * @returns true if the input is valid, otherwise an error message
 */
export const validateWith =
  <S extends ZodSchema>(schema: S) =>
  (input: unknown) => {
    try {
      schema.parse(input);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.message;
      }
      throw error;
    }
  };

export const validators = {
  nonEmpty: validateWith(z.string().nonempty("This field cannot be empty")),
  optionalString: validateWith(z.string().optional()),
  numeric: validateWith(
    // should receive a string and verify that it's a number
    z.string().refine((value) => !isNaN(Number(value)), {
      message: "This field must be a number",
    })
  ),
  url: validateWith(
    z.string().url("This field must be a valid URL (e.g. https://example.com)")
  ),
};

export const confirmPrompt = (draft: {}) =>
  select({
    message: `Is this correct? \n${prettyPrint(draft)}\n`,
    choices: [
      {
        name: "Yes",
        value: "true",
      },
      {
        name: "No (edit record)",
        value: "false",
      },
      {
        name: "Exit",
        value: "exit",
      },
    ],
  }).then((value) => {
    if (value === "exit") {
      process.exit(0);
    }
    return value === "true";
  });
