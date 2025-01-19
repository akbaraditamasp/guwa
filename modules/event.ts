import axios, { type AxiosResponse } from "axios";
import GuwaEvent from "../utils/event";
import env from "./env";

class Event {
  public ev = new GuwaEvent();

  boot() {
    if (!env.get("CALLBACK_URL")) return;

    const client = <T>(data: T) =>
      axios.post(env.get("CALLBACK_URL")!, data, {
        headers: {
          Authorization: env.get("APP_PASSWORD")
            ? `Bearer ${env.get("APP_PASSWORD")}`
            : undefined,
        },
      });

    this.ev.on("connection", (id, data) => {
      client({
        id,
        data,
        event: "connection",
      }).catch(() => {});
    });

    this.ev.on("message", (id, data) => {
      client({
        id,
        data,
        event: "message",
      }).catch(() => {});
    });

    this.ev.on("logout", (id, data) => {
      client({
        id,
        data,
        event: "logout",
      }).catch(() => {});
    });
  }
}

export default new Event();
