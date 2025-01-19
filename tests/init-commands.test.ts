import { expect, test } from "bun:test";
import { prepare } from "../commands/init";

test("Prepare config", async () => {
  expect(
    await prepare({
      APP_NAME: "GUWA",
      APP_PASSWORD: "123456",
      AUTH_PATH: "./auths",
      CALLBACK_URL: "http://google.com",
      LOG_PATH: "./logs",
      PORT: 3000,
      THROTTLE_INTERVAL: 5000,
    })
  ).not.fail();
});
