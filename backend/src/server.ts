import dotenv from "dotenv";
dotenv.config(); // 🔥 WAJIB PALING ATAS

import http from "http";
import app from "./app";

const server = http.createServer(app);

// KEEP ALIVE
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
