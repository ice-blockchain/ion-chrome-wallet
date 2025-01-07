const { notify, exec } = require("./utils");
require("dotenv").config();

notify(`Build ION Wallet UI`);

exec("npx react-app-rewired build", {
  stdio: "inherit",
  env: {
    ...process.env,
    INLINE_RUNTIME_CHUNK: false,
  },
});

notify(`Build ION Wallet background.js, provider.js, content.js`);

exec("npx webpack -c task/webpack.config.js", {
  stdio: "inherit",
  env: process.env,
});

notify(`Happy End! 🚀🚀🚀`);
