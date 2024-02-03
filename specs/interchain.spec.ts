import { test, describe, expect } from "vitest";
import { globby } from "zx";
import { validate } from "jsonschema";

const files = await globby("registry/**/interchain/*tokenlist.json");
const schema = await import(
  "../registry/schemas/interchain-tokenlist.schema.json"
);

describe("InterchainTokenList Configs", async () => {
  for (const file of files) {
    test(`${file} should match the schema`, async () => {
      const { default: config } = await import(`../${file}`);

      const result = validate(config, schema);

      if (!result.valid) {
        console.log({ errors: result.errors.map((x) => x.message) });
      }

      expect(result.errors).toEqual([]);
    });
  }
});
