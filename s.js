const { io } = require("socket.io-client");

const socket = io("http://localhost:3500", {
  reconnectionDelayMax: 10000,
});

socket.on("connect", () => {
    console.log(socket.id); // "G5p5..."
});
