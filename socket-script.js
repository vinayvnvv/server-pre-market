function main() {
  console.log("main");
  let i = 0;
  const interval = setInterval(() => {
    i++;
    console.log("call", i, new Date().getHours(), new Date().getMinutes());
    if (i === 400) {
      clearInterval(interval);
      process.exit();
    }
  }, 1000);
}
main();
