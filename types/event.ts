export type EventType = {
  connection: {
    status: "CONNECTING" | "DISCONNECTED" | "CONNECTED";
    qr?: string;
  };
  message: {
    from: string;
    text: string;
  };
  logout: {};
};
