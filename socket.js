const FyersSocket = require("fyers-api-v3").fyersDataSocket;

const isEnd = () => {
  const now = new Date();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  if (hours === 9 && minutes === 9) {
    return true;
  } else {
    return false;
  }
};

const fyers_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZDoxIiwiZDoyIiwieDowIiwieDoxIiwieDoyIl0sImF0X2hhc2giOiJnQUFBQUFCb05vSVVSTzhjM1VEWi1idVF0aU1LcjdrUV9NLWtjVHlvQl9halQ0Zm5VbEpEZ1ZWWXMteW5TcGNqUWxNRXdfSVFETk1WdVJEc015SnExX1djeWZMeHJkMVFvZEYzTXY5REZ6QmJLQ2pxQ3BxblJsVT0iLCJkaXNwbGF5X25hbWUiOiIiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiIzNjJlN2NiZWM5YmIxMGIxZWZhODZjY2FjYjQ3Zjk0MzM1M2U1YzJiNDNhNGRiYzc0MjdmY2JiZSIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImZ5X2lkIjoiWEIwOTAzNyIsImFwcFR5cGUiOjEwMCwiZXhwIjoxNzQ4NDc4NjAwLCJpYXQiOjE3NDg0MDI3MDgsImlzcyI6ImFwaS5meWVycy5pbiIsIm5iZiI6MTc0ODQwMjcwOCwic3ViIjoiYWNjZXNzX3Rva2VuIn0.laxxeD3XoQd-xPbjEDSToF5stFnsbuz0zQdVik4F_fc";

function connect() {
  var fyersdata = new FyersSocket(fyers_token);
  function onmsg(message) {
    console.log("connnected", message);
    if (isEnd()) {
      process.exit();
    }
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

module.exports = connect;
