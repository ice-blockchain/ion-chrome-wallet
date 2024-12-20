const { notify, exec } = require("./utils");
require("dotenv").config();

notify(`Build IONWallet UI`);

exec("npx react-app-rewired build", {
  stdio: "inherit",
  env: {
    ...process.env,
    INLINE_RUNTIME_CHUNK: false,
  },
});

notify(`Build IONWallet background.js, provider.js, content.js`);

exec("npx webpack -c task/webpack.config.js", {
  stdio: "inherit",
  env: process.env,
});

notify(`Happy End! 🚀🚀🚀`);
