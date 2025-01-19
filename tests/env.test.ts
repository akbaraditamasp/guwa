import { expect, test } from "bun:test";
import env from "../modules/env";

const checkOutput = () => {
  expect(env.get("APP_NAME")).toBeString();
  expect(env.get("APP_PASSWORD")).toBeString();
  expect(env.get("AUTH_PATH")).toBeString();
  expect(env.get("CALLBACK_URL")).toBeString();
  expect(env.get("LOG_PATH")).toBeString();
  expect(env.get("PORT")).toBeNumber();
  expect(env.get("THROTTLE_INTERVAL")).toBeNumber();
};

test("Load environment from object", async () => {
  expect(
    await env.load({
      APP_NAME: "GUWA",
      APP_PASSWORD: "123456",
      AUTH_PATH: "./auths",
      CALLBACK_URL: "http://google.com",
      LOG_PATH: "./logs",
      PORT: 3000,
      THROTTLE_INTERVAL: 5000,
    })
  ).not.fail();

  checkOutput();
});

test("Load environment from process", async () => {
  expect(await env.load()).not.fail();

  checkOutput();
});

test("Load from config file", async () => {
  expect(await env.load("./config.example.json")).not.fail();

  checkOutput();
});

test("Default value", async () => {
  expect(await env.load({})).not.fail();

  expect(env.get("APP_NAME", "GUWA CUSTOM")).toEqual("GUWA CUSTOM");
  expect(env.get("APP_PASSWORD", "SUPER_SECRET")).toEqual("SUPER_SECRET");
  expect(env.get("AUTH_PATH", "./auth")).toEqual("./auth");
  expect(env.get("CALLBACK_URL", "/callback")).toEqual("/callback");
  expect(env.get("LOG_PATH", "./log")).toEqual("./log");
  expect(env.get("PORT", 8080)).toEqual(8080);
  expect(env.get("THROTTLE_INTERVAL", 10000)).toEqual(10000);
});
