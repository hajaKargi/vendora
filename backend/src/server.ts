import dotenv from "dotenv";
dotenv.config(); 

import app from "./app";
import settings from "./core/config/settings";

const server = app;
const port = settings.serverPort || 8000;

server.listen(port, () => {
  console.log(`🚀🚀🚀 Aurora's server is running at http://localhost:${port} 🚀🚀🚀`);
});
