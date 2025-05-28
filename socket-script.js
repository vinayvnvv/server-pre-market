const { getRefreshToken } = require("./firebase");
const connect = require("./socket");
const { sha256 } = require("js-sha256");
const nDate = new Date().toLocaleString("en-US", {
  timeZone: "Asia/Calcutta",
});
console.log(nDate);

const access = async (refresh_token) => {
  try {
    let res = await fetch(
      "https://api-t1.fyers.in/api/v3/validate-refresh-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          appIdHash: sha256(`${"GIY41IH4EM-100"}:${"VWQJ5BGDY3"}`),
          refresh_token: refresh_token,
          pin: "1994",
        }),
      }
    );
    res = await res.json();
    console.log(res);
    if (res.code === 200) {
      return res.access_token;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const refresh = async () => {
  try {
    const r = await getRefreshToken();
    const data = r.data();
    if (data) {
      console.log(data);
      return data;
    } else return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

async function main() {
  const token = await refresh();
  if (!token) {
    console.log("failed to fetch refreshtoken from firebase");
    process.exit();
  }
  const accessToken = await access(token.refresh);
  if (!accessToken) {
    console.log("failed to fetch access token  from fyers");
    process.exit();
  }
  if (accessToken) connect(accessToken);
  console.log(accessToken);
}
main();
