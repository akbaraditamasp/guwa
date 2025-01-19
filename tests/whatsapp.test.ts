import { test, expect } from "bun:test";
import Device from "../utils/device";
import event from "../modules/event";
import qr from "qrcode-terminal";
import type { EventType } from "../types/event";

let openedConnection: Device;

test("Initiate new device with generated id", async () => {
  const device = new Device();
  expect(await device.start()).not.fail();
  device.remove();
});

test("Initiate new device with id", async () => {
  const device = new Device("test");
  expect(await device.start()).not.fail();
  device.remove();
});

test("Making a connection", async () => {
  const device = new Device("test");

  let connectionCallback:
    | ((_id: string, data: EventType["connection"]) => void)
    | undefined = undefined;

  expect(
    await new Promise<void>(async (resolve) => {
      connectionCallback = (_id: string, data: EventType["connection"]) => {
        if (data.qr) {
          console.log(
            "Please make first whatsapp connection for continue the test"
          );
          qr.generate(data.qr, { small: true });
        }

        if (data.status === "CONNECTED") {
          setTimeout(() => resolve(), 10000);
        }
      };
      event.ev.on("connection", connectionCallback);
      expect(await device.start()).not.fail();
    })
  ).not.fail();

  if (connectionCallback)
    event.ev.removeListener("connection", connectionCallback);

  openedConnection = device;
}, 30000);

test("Send text message", async () => {
  expect(
    await openedConnection.throttledSend("6281271762774", {
      text: "Hello world!",
    })
  ).not.fail();

  await new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, 10000)
  );
}, 15000);
