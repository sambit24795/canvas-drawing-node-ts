import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export default function (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) {
  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("node-canvas-data", data);
  });
}
