function main() {
  console.log("main");
  let i = 0;
  const interval = setInterval(() => {
    i++;
    console.log("call", i);
    if (i === 50) {
      clearInterval(interval);
      process.exit();
    }
  }, 1000);
}
main();
