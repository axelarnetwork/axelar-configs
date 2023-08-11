import { test, describe, expect } from "vitest";
import { globby } from "zx";
import { validate } from "jsonschema";

const files = await globby("registry/**/cosmos/*chain.json");
const schema = await import("../registry/cosmos-chain.schema.json");

describe("Cosmos Chain Configs", async () => {
  for (const file of files) {
    test(`${file} should match the schema`, async () => {
      const { default: config } = await import(`../${file}`);

      const result = validate(config, schema);

      if (!result.valid) console.log({ errors: result.errors, file });

      expect(result.valid).toBe(true);
    });
  }
});
