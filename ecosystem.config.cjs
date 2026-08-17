module.exports = {
  apps: [
    {
      name: "dogiadungnhat-api",
      cwd: "/home/dogiadungnhat/backend",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4088,
      },
    },
    {
      name: "dogiadungnhat-web",
      cwd: "/home/dogiadungnhat/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 0.0.0.0 -p 3088",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3088,
      },
    },
  ],
};
