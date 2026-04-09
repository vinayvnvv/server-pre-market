var UpstoxClient = require("upstox-js-sdk");
var defaultClient = UpstoxClient.ApiClient.instance;
var OAUTH2 = defaultClient.authentications["OAUTH2"];
OAUTH2.accessToken =
  "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiIyUUFFQjUiLCJqdGkiOiI2OWQ3MTkxNzhlNTlkMTJjZjU3MDFkNDEiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaXNFeHRlbmRlZCI6dHJ1ZSwiaWF0IjoxNzc1NzA0MzQzLCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE4MDczMDgwMDB9.T0pBbG4tWVcG6TE2MBkRtBp-1ts3j6LPpvAbvWN-giI";

const streamer = new UpstoxClient.MarketDataStreamerV3(
  ["NSE_INDEX|Nifty 50"],
  "ltpc",
);
streamer.connect();

streamer.on("message", (data) => {
  const feed = data.toString("utf-8");
  console.log(feed);
});
