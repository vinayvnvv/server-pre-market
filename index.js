const cron = require("node-cron");
const FyersSocket = require("fyers-api-v3").fyersDataSocket;

const fyers_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZDoxIiwiZDoyIiwieDowIiwieDoxIiwieDoyIl0sImF0X2hhc2giOiJnQUFBQUFCb0xVSlFHc2k1MDc4NzBXVXlmWThpaDJ4X28yaUM1TTRXUXlqaV9ybVI5TVlBTC0yMVVTQTFSZzdEai1pblRLbWxRZEgyTlJteFBuSGpSUjY5bmpQb3Q0OGlRVEwxeVRTaVphWnhJeVVUQlNtTU00TT0iLCJkaXNwbGF5X25hbWUiOiIiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiIzNjJlN2NiZWM5YmIxMGIxZWZhODZjY2FjYjQ3Zjk0MzM1M2U1YzJiNDNhNGRiYzc0MjdmY2JiZSIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImZ5X2lkIjoiWEIwOTAzNyIsImFwcFR5cGUiOjEwMCwiZXhwIjoxNzQ3ODczODAwLCJpYXQiOjE3NDc3OTY1NjAsImlzcyI6ImFwaS5meWVycy5pbiIsIm5iZiI6MTc0Nzc5NjU2MCwic3ViIjoiYWNjZXNzX3Rva2VuIn0.G1XdYnq9oDgr8GWxOzSI781el_r3S03pLQ8C5GfM3v0";

function connect() {
  var fyersdata = new FyersSocket(fyers_token);
  function onmsg(message) {
    console.log("connnected", message);
  }

  function onconnect() {
    fyersdata.subscribe(["NSE:NIFTY50-INDEX"]); //not subscribing for market depth data
    fyersdata.mode(fyersdata.LiteMode); //set data mode to lite mode
    fyersdata.autoreconnect(); //enable auto reconnection mechanism in case of disconnection
  }

  function onerror(err) {
    console.log(err);
  }

  function onclose() {
    console.log("socket closed");
  }

  fyersdata.on("message", onmsg);
  fyersdata.on("connect", onconnect);
  fyersdata.on("error", onerror);
  fyersdata.on("close", onclose);

  fyersdata.connect();
}

cron.schedule("30 8 * * *", () => {
  // connect();
  console.log("running a task every minute");
});
