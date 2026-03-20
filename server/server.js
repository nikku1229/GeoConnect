const http = require("http");
const app = require("./src/app");
const { Server } = require("socket.io");
require("dotenv").config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_PRODUCTION_URL, process.env.CLIENT_URL],
    methods: ["GET", "POST"],
  },
});

require("./src/sockets/socketHandler")(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
