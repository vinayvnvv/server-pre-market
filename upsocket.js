const protobuf = require("protobufjs");
const WebSocket = require("ws");

var protobufRoot;
var upToken =
  "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiIyUUFFQjUiLCJqdGkiOiI2OWQ3MTkxNzhlNTlkMTJjZjU3MDFkNDEiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaXNFeHRlbmRlZCI6dHJ1ZSwiaWF0IjoxNzc1NzA0MzQzLCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE4MDczMDgwMDB9.T0pBbG4tWVcG6TE2MBkRtBp-1ts3j6LPpvAbvWN-giI";

const initProtobuf = async () => {
  protobufRoot = await protobuf.load("./marketDataFeed.proto");
  console.log("Protobuf part initialization complete");
};

async function getMarketDataFeedForSocket() {
  try {
    const response = await fetch(
      "https://api.upstox.com/v3/feed/market-data-feed/authorize",
      {
        method: "GET",
        headers: new Headers({
          Accept: "application/json",
          Authorization: `Bearer ${upToken}`,
        }),
      },
    );
    const data = await response.json();
    console.log("data", data);
    return data.data.authorizedRedirectUri;
  } catch (error) {
    console.log("error", error);
    return null;
  }
}

const decodeProfobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }
  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse",
  );
  return FeedResponse.decode(buffer);
};

const connect = async (callback) => {
  console.log("connecting to socket");
  const wsUrl = await getMarketDataFeedForSocket();
  console.log("wsUrl", wsUrl);
  const ws = new WebSocket(wsUrl);
  ws.on("open", () => {
    console.log("Connected");
  });

  ws.on("close", () => {
    console.log("Disconnected");
  });

  ws.on("message", (data) => {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const response = decodeProfobuf(buffer);
    if (callback) callback(response?.feeds);
  });

  ws.on("error", (error) => {
    console.log("WebSocket error:", error);
  });
};

const main = async () => {
  await initProtobuf();
  await connect((feeds) => {
    console.log("feeds", feeds);
  });
};

main();
