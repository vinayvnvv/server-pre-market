const { updateMarketData, saveMinuteCandles } = require("./firebase");

var UpstoxClient = require("upstox-js-sdk");
var defaultClient = UpstoxClient.ApiClient.instance;
var OAUTH2 = defaultClient.authentications["OAUTH2"];

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

  return hour === 10 && minute === 8;
};

// const fyers_token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZDoxIiwiZDoyIiwieDowIiwieDoxIiwieDoyIl0sImF0X2hhc2giOiJnQUFBQUFCb05vSVVSTzhjM1VEWi1idVF0aU1LcjdrUV9NLWtjVHlvQl9halQ0Zm5VbEpEZ1ZWWXMteW5TcGNqUWxNRXdfSVFETk1WdVJEc015SnExX1djeWZMeHJkMVFvZEYzTXY5REZ6QmJLQ2pxQ3BxblJsVT0iLCJkaXNwbGF5X25hbWUiOiIiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiIzNjJlN2NiZWM5YmIxMGIxZWZhODZjY2FjYjQ3Zjk0MzM1M2U1YzJiNDNhNGRiYzc0MjdmY2JiZSIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImZ5X2lkIjoiWEIwOTAzNyIsImFwcFR5cGUiOjEwMCwiZXhwIjoxNzQ4NDc4NjAwLCJpYXQiOjE3NDg0MDI3MDgsImlzcyI6ImFwaS5meWVycy5pbiIsIm5iZiI6MTc0ODQwMjcwOCwic3ViIjoiYWNjZXNzX3Rva2VuIn0.laxxeD3XoQd-xPbjEDSToF5stFnsbuz0zQdVik4F_fc";

function connect(upstox_token) {
  OAUTH2.accessToken = upstox_token;
  const streamer = new UpstoxClient.MarketDataStreamerV3(
    ["NSE_INDEX|Nifty 50"],
    "ltpc",
  );
  let high = 0,
    start = 0,
    startInit = false,
    low = 0,
    ltp = 0;
  const candles = [];
  const currentCandlesBySymbol = new Map();

  const asiaMinuteFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const normalizeTsToMs = (ts) => {
    const n = typeof ts === "string" ? Number(ts) : ts;
    if (!Number.isFinite(n)) return null;
    // Heuristic: seconds are ~1e9-1e10; ms are ~1e12+
    return n < 1e12 ? n * 1000 : n;
  };

  const getMinuteKey = (tsMs) => {
    const d = new Date(tsMs);
    const parts = asiaMinuteFormatter.formatToParts(d);
    const pick = (type) => parts.find((p) => p.type === type)?.value;
    // Example: "2026-03-25 09:17"
    return `${pick("year")}-${pick("month")}-${pick("day")} ${pick(
      "hour",
    )}:${pick("minute")}`;
  };

  /** Epoch ms for the start of that minute in Asia/Kolkata (e.g. 9:15:00.000 IST). */
  const getMinuteStartMs = (tsMs) => {
    const d = new Date(tsMs);
    const parts = asiaMinuteFormatter.formatToParts(d);
    const pick = (type) => parts.find((p) => p.type === type)?.value;
    const y = pick("year");
    const m = pick("month");
    const day = pick("day");
    const h = pick("hour");
    const min = pick("minute");
    return new Date(`${y}-${m}-${day}T${h}:${min}:00+05:30`).getTime();
  };

  const flushCurrentCandles = () => {
    for (const candle of currentCandlesBySymbol.values()) candles.push(candle);
    currentCandlesBySymbol.clear();
  };

  var interval = setInterval(async () => {
    console.log("running", ltp);
    console.log("candles", candles);
    saveMinuteCandles(candles);
    if (start !== 0) startInit = true;
    if (isEnd()) {
      console.log("end", high, low, ltp, candles);
      flushCurrentCandles();
      // await updateMarketData({ high, low, ltp, start });
      // await saveMinuteCandles(candles);
      clearInterval(interval);
      process.exit();
    }
  }, 4000);

  const saveCandles = (data) => {
    const symbol = data?.symbol;
    const ltpNum = Number(data?.ltp);
    const tsMs = data?.exch_feed_time;
    if (!symbol || !Number.isFinite(ltpNum) || tsMs === null) return;

    const minuteKey = getMinuteKey(tsMs);
    const time = getMinuteStartMs(tsMs);
    const existing = currentCandlesBySymbol.get(symbol);

    if (!existing) {
      currentCandlesBySymbol.set(symbol, {
        symbol,
        minuteKey,
        time,
        open: ltpNum,
        high: ltpNum,
        low: ltpNum,
        close: ltpNum,
        openTs: tsMs,
        closeTs: tsMs,
      });
      return;
    }

    // Minute boundary detected -> finalize previous candle and start new one
    if (existing.minuteKey !== minuteKey) {
      candles.push(existing);
      currentCandlesBySymbol.set(symbol, {
        symbol,
        minuteKey,
        time,
        open: ltpNum,
        high: ltpNum,
        low: ltpNum,
        close: ltpNum,
        openTs: tsMs,
        closeTs: tsMs,
      });
      return;
    }

    existing.high = Math.max(existing.high, ltpNum);
    existing.low = Math.min(existing.low, ltpNum);
    existing.close = ltpNum;
    existing.closeTs = tsMs;
  };
  function onmsg(message) {
    // console.log("message", message);
    saveCandles(message);
    const { ltp: _ltpRaw } = message || {};
    const _ltp = Number(_ltpRaw);
    if (start === 0 && _ltp) start = _ltp;
    if (startInit) {
      startInit = false;
      if (_ltp) start = _ltp;
    }
    if (Number.isFinite(_ltp) && _ltp) {
      if (high === 0) high = _ltp;
      if (low === 0) low = _ltp;
      if (_ltp > high) high = _ltp;
      if (_ltp < low) low = _ltp;
      ltp = _ltp;
    }
  }

  streamer.connect();

  streamer.on("message", (data) => {
    const feed = data.toString("utf-8");
    const _feed = JSON.parse(feed)?.feeds?.["NSE_INDEX|Nifty 50"]?.ltpc;
    if (_feed) {
      onmsg({
        exch_feed_time: Number(_feed.ltt),
        ltp: _feed.ltp,
        symbol: "NSE_INDEX|Nifty 50",
      });
    }
  });
}

module.exports = connect;
