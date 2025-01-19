import makeWASocket, {
  Browsers,
  DisconnectReason,
  type AnyMessageContent,
} from "@whiskeysockets/baileys";
import type { EventType } from "../types/event";
import pThrottle from "p-throttle";
import env from "../modules/env";
import { cancelJob, scheduleJob, type Job } from "node-schedule";
import { createId } from "@paralleldrive/cuid2";
import { useMultiFileAuthState } from "@whiskeysockets/baileys";
import { join } from "node:path";
import pino from "pino";
import PinoPretty from "pino-pretty";
import SonicBoom from "sonic-boom";
import type { Boom } from "@hapi/boom";
import { rmSync } from "node:fs";
import moment from "moment";
import event from "../modules/event";

export default class Device {
  public id!: string;
  public sock!: ReturnType<typeof makeWASocket>;
  public status: EventType["connection"] = {
    status: "CONNECTING",
  };
  private throttle = pThrottle({
    limit: 1,
    interval: env.get("THROTTLE_INTERVAL", 0),
  });
  private autoRestart?: Job;

  constructor(id?: string) {
    this.id = id || createId();
  }

  async start() {
    if (this.autoRestart) cancelJob(this.autoRestart);

    const auth = await useMultiFileAuthState(
      join(env.get("AUTH_PATH", "./auths"), this.id)
    );

    this.sock = makeWASocket({
      auth: auth.state,
      browser: Browsers.baileys(env.get("APP_NAME", "GUWA")),
      logger: pino(
        PinoPretty({
          colorize: false,
          destination: new SonicBoom({
            dest: join(env.get("LOG_PATH", "./logs"), this.id),
            mkdir: true,
          }),
        })
      ) as any,
    });

    this.sock.ev.on("creds.update", auth.saveCreds);

    this.sock.ev.on("connection.update", async (socket) => {
      const { connection, lastDisconnect, qr } = socket;

      this.status.qr = qr;

      if (connection === "close") {
        if (
          (lastDisconnect?.error as Boom)?.output?.statusCode ===
          DisconnectReason.loggedOut
        ) {
          rmSync(join(env.get("AUTH_PATH", "./auths"), this.id), {
            recursive: true,
          });
          this.remove();
          event.ev.emit("logout", this.id, {});
        }

        if (
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.connectionReplaced &&
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.connectionLost
        ) {
          await this.start();
        }
      } else if (connection === "open") {
        this.status.status = "CONNECTED";

        if (!this.autoRestart) {
          this.autoRestart = scheduleJob(
            moment().add(30, "minutes").toDate(),
            async () => {
              this.autoRestart = undefined;
              await this.start();
            }
          );
        }
      }

      event.ev.emit("connection", this.id, this.status);
    });
  }

  remove() {
    this.status.status = "DISCONNECTED";

    this.sock.ev.removeAllListeners("connection.update");
    this.sock.ev.removeAllListeners("creds.update");
    this.sock.ev.removeAllListeners("messages.upsert");

    this.sock.end(undefined);
  }

  public throttledSend = this.throttle(
    async (to: string, data: AnyMessageContent) => {
      const targets = await this.sock.onWhatsApp(to);

      if (targets.length > 0) {
        const [id] = targets;

        if (id.exists) {
          this.sock.sendMessage(id.jid, data);
        }
      }
    }
  );
}
