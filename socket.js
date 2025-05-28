const { updateMarketData } = require("./firebase");

const FyersSocket = require("fyers-api-v3").fyersDataSocket;

const isEnd = () => {
  const now = new Date();

  // Create a formatter for the Kolkata timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // use 24-hour format
  });

  const [hourStr, minuteStr] = formatter.format(now).split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  return hour === 11 && minute === 6;
};

// const fyers_token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZDoxIiwiZDoyIiwieDowIiwieDoxIiwieDoyIl0sImF0X2hhc2giOiJnQUFBQUFCb05vSVVSTzhjM1VEWi1idVF0aU1LcjdrUV9NLWtjVHlvQl9halQ0Zm5VbEpEZ1ZWWXMteW5TcGNqUWxNRXdfSVFETk1WdVJEc015SnExX1djeWZMeHJkMVFvZEYzTXY5REZ6QmJLQ2pxQ3BxblJsVT0iLCJkaXNwbGF5X25hbWUiOiIiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiIzNjJlN2NiZWM5YmIxMGIxZWZhODZjY2FjYjQ3Zjk0MzM1M2U1YzJiNDNhNGRiYzc0MjdmY2JiZSIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImZ5X2lkIjoiWEIwOTAzNyIsImFwcFR5cGUiOjEwMCwiZXhwIjoxNzQ4NDc4NjAwLCJpYXQiOjE3NDg0MDI3MDgsImlzcyI6ImFwaS5meWVycy5pbiIsIm5iZiI6MTc0ODQwMjcwOCwic3ViIjoiYWNjZXNzX3Rva2VuIn0.laxxeD3XoQd-xPbjEDSToF5stFnsbuz0zQdVik4F_fc";

function connect(fyers_token) {
  var fyersdata = new FyersSocket(fyers_token);
  let high = 0,
    low = 0,
    ltp = 0;
  var interval = setInterval(async () => {
    console.log("running", ltp);
    if (isEnd()) {
      console.log("end", high, low, ltp);
      await updateMarketData({ high, low, ltp });
      clearInterval(interval);
      process.exit();
    }
  }, 4000);
  function onmsg(message) {
    const { ltp: _ltp } = message || {};
    if (_ltp) {
      if (high === 0) high = _ltp;
      if (low === 0) low = _ltp;
      if (_ltp > high) high = _ltp;
      if (_ltp < low) low = _ltp;
      ltp = _ltp;
    }
  }

  function onconnect() {
    console.log("connected socket");
    fyersdata.subscribe(["NSE:NIFTY50-INDEX"]); //not subscribing for market depth data
    fyersdata.mode(fyersdata.LiteMode); //set data mode to lite mode
    fyersdata.autoreconnect(); //enable auto reconnection mechanism in case of disconnection
  }

  function onerror(err) {
    console.log("socket err", err);
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
