import { input, number } from "@inquirer/prompts";
import type { GuwaEnv } from "../types/env";
import { createId } from "@paralleldrive/cuid2";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
import boxen from "boxen";

export async function prepare(config: GuwaEnv) {
  const authPath = Bun.file(config.AUTH_PATH);
  const logPath = Bun.file(config.LOG_PATH);

  try {
    if (!(await authPath.exists())) {
      mkdirSync(config.AUTH_PATH);
    }

    if (!(await logPath.exists())) {
      mkdirSync(config.LOG_PATH);
    }
  } catch (e) {}

  await Bun.write("./config.json", JSON.stringify(config));
}

export default async function init() {
  const config: GuwaEnv = {
    APP_NAME: await input({
      message: "What is the name of your application?",
      default: "GUWA Engine",
      required: true,
    }),
    APP_PASSWORD: createId().toUpperCase(),
    PORT: (await number({
      message: "What port would you like to use?",
      default: 3000,
      required: true,
    }))!,
    AUTH_PATH: await input({
      message: "Where would you like to store your authentication files?",
      default: resolve("auths"),
      required: true,
    }),
    CALLBACK_URL: await input({
      message: "What is the callback URL?",
      required: false,
    }),
    THROTTLE_INTERVAL: (await number({
      message:
        "How long should the interval be, in milliseconds, between each message sent?",
      default: 0,
      required: true,
    }))!,
    LOG_PATH: await input({
      message: "Where would you like to store your log files?",
      default: resolve("logs"),
      required: true,
    }),
  };

  await prepare(config);

  const resultText = `$ guwa run config.json`;

  console.log("\n");
  console.log(
    boxen(resultText, {
      padding: 1,
      title: "Run the following commands to start GUWA rest API server",
    })
  );
}
