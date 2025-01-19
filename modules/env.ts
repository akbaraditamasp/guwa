import { z } from "zod";
import type { GuwaEnv } from "../types/env";

class Env {
  private data!: Partial<GuwaEnv>;

  async load(config?: Partial<GuwaEnv> | string) {
    let data: { [key: string]: any } = process.env;

    if (typeof config === "string") {
      const file = Bun.file(config);

      if (!(await file.exists())) {
        throw new Error("Config not found");
      }

      data = JSON.parse(await file.text());
    } else if (config) {
      data = config;
    }

    this.data = await z
      .object({
        PORT: z.coerce.number().optional(),
        AUTH_PATH: z.string().optional(),
        THROTTLE_INTERVAL: z.coerce.number().optional(),
        LOG_PATH: z.string().optional(),
        CALLBACK_URL: z.string().optional(),
        APP_NAME: z.string().optional(),
        APP_PASSWORD: z.string().optional(),
      })
      .safeParseAsync(data)
      .then(({ data, success }) => (success ? data : {}));
  }

  get<T extends keyof GuwaEnv>(key: T, defaultValue: GuwaEnv[T]): GuwaEnv[T];
  get<T extends keyof GuwaEnv>(
    key: T,
    defaultValue?: undefined
  ): GuwaEnv[T] | undefined;
  get<T extends keyof GuwaEnv>(
    key: T,
    defaultValue?: GuwaEnv[T]
  ): GuwaEnv[T] | undefined {
    return this.data[key] || defaultValue;
  }
}

export default new Env();
