const { getAccessToken } = require("./firebase");
const connect = require("./socket");
const { sha256 } = require("js-sha256");
const nDate = new Date().toLocaleString("en-US", {
  timeZone: "Asia/Calcutta",
});
console.log(nDate);

const access = async () => {
  try {
    const r = await getAccessToken();
    const data = r.data();
    if (data && data.access_token) {
      console.log(data);
      return data.access_token;
    } else return false;
  } catch (err) {
    console.log("ss", err);
    return false;
  }
};

async function main() {
  // const token = await refresh();
  // if (!token) {
  //   console.log("failed to fetch refreshtoken from firebase");
  //   process.exit();
  // }
  const accessToken = await access();
  if (!accessToken) {
    console.log("failed to fetch access token  from fyers");
    process.exit();
  }
  if (accessToken) connect(accessToken);
  console.log(accessToken);
}
main();
