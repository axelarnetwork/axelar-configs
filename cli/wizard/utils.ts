import { select } from "@inquirer/prompts";
import { z, ZodSchema } from "zod";

export const prettyPrint = <T extends Record<string, unknown>>(obj: T) =>
  JSON.stringify(obj, null, 2);

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
