console.log("vscode background task begins pattern");

sleep(3000).then(() => {
  console.log("vscode background task ends pattern");
  return sleep(3000);
}).then(() => {
  console.log("vscode task ends pattern");
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}