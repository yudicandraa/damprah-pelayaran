import http from "http";
import app from "./app";

const server = http.createServer(app);

// 🔥 KEEP ALIVE FIX
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(4000, () => {
  console.log("Server running on port 4000");
});
