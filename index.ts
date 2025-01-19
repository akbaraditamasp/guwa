import env from "./modules/env";

env.load().then(() => {
  const data = env.get("APP_NAME");
});
