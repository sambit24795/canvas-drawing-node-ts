"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const cluster_1 = __importDefault(require("cluster"));
const net_1 = __importDefault(require("net"));
const os_1 = require("os");
const socket_io_redis_1 = require("socket.io-redis");
const redis_1 = require("redis");
const farmhash_1 = __importDefault(require("farmhash"));
const connectDb_1 = __importDefault(require("./utils/connectDb"));
const socketMain_1 = __importDefault(require("./socketMain"));
const userRoutes_1 = require("./router/userRoutes");
const imageRoutes_1 = require("./router/imageRoutes");
const port = process.env.PORT || 5000;
const app = express_1.default();
app.use(cors_1.default({ origin: "http://localhost:3000" }));
app.use(express_1.default.json());
const num_processes = os_1.cpus().length;
if (cluster_1.default.isMaster) {
    // This stores our workers. We need to keep them to be able to reference
    // them based on source IP address. It's also useful for auto-restart,
    // for example.
    let workers = [];
    // Helper function for spawning worker at index 'i'.
    let spawn = function (i) {
        workers[i] = cluster_1.default.fork();
        // Optional: Restart worker on exit
        workers[i].on("exit", function () {
            // console.log('respawning worker', i);
            spawn(i);
        });
    };
    // Spawn workers.
    for (var i = 0; i < num_processes; i++) {
        spawn(i);
    }
    // Helper function for getting a worker index based on IP address.
    // This is a hot path so it should be really fast. The way it works
    // is by converting the IP address to a number by removing non numeric
    // characters, then compressing it to the number of slots we have.
    //
    // Compared against "real" hashing (from the sticky-session code) and
    // "real" IP number conversion, this function is on par in terms of
    // worker index distribution only much faster.
    const worker_index = function (ip, len) {
        return farmhash_1.default.fingerprint32(ip) % len; // Farmhash is the fastest and works with IPv6, too
    };
    // in this case, we are going to start up a tcp connection via the net
    // module INSTEAD OF the http module. Express will use http, but we need
    // an independent tcp port open for cluster to work. This is the port that
    // will face the internet
    const server = net_1.default.createServer({ pauseOnConnect: true }, (connection) => {
        // We received a connection and need to pass it to the appropriate
        // worker. Get the worker for this connection's source IP and pass
        // it the connection.
        let worker = workers[worker_index(connection.remoteAddress, num_processes)];
        worker.send("sticky-session:connection", connection);
    });
    server.listen(port);
    console.log(`Master listening on port ${port}`);
}
else {
    connectDb_1.default();
    app.use("/user", userRoutes_1.userRoutes);
    app.use("/image", imageRoutes_1.imageRoutes);
    // Don't expose our internal server to the outside world.
    const server = app.listen(0, "localhost");
    // console.log("Worker listening...");
    const io = new socket_io_1.Server(server, { cors: { origin: "http://localhost:3000" } });
    // Tell Socket.IO to use the redis adapter. By default, the redis
    // server is assumed to be on localhost:6379. You don't have to
    // specify them explicitly unless you want to change them.
    // redis-cli monitor
    const pubClient = new redis_1.RedisClient({ host: "localhost", port: 6379 });
    const subClient = pubClient.duplicate();
    io.adapter(socket_io_redis_1.createAdapter({ pubClient, subClient }));
    // Here you might use Socket.IO middleware for authorization etc.
    // on connection, send the socket over to our module with socket stuff
    io.on("connection", function (socket) {
        socketMain_1.default(io, socket);
        // console.log(`connected to worker: ${cluster.worker.id}`);
    });
    // Listen to messages sent from the master. Ignore everything else.
    process.on("message", function (message, connection) {
        if (message !== "sticky-session:connection") {
            return;
        }
        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit("connection", connection);
        connection.resume();
    });
}
