console.log('ojbk22!');
console.log(process.cwd());

let i = 0;
setInterval(() => {
  console.log('timer:', ++i);
  if (i > 4) {
    process.exit();
  }
}, 500);
