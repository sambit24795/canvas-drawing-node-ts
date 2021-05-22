"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(io, socket) {
    socket.on("canvas-data", (data) => {
        socket.broadcast.emit("node-canvas-data", data);
    });
}
exports.default = default_1;
