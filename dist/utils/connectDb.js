"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
function connectDb() {
    const mongoServer = new mongodb_memory_server_1.MongoMemoryServer();
    mongoose_1.default.Promise = Promise;
    mongoServer.getUri().then((mongoUri) => {
        const mongooseOpts = {
            // options for mongoose 4.11.3 and above
            autoReconnect: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000,
        };
        mongoose_1.default.connect(mongoUri, mongooseOpts);
        mongoose_1.default.connection.on("error", (e) => {
            if (e.message.code === "ETIMEDOUT") {
                console.log(e);
                mongoose_1.default.connect(mongoUri, mongooseOpts);
            }
            console.log(e);
        });
        mongoose_1.default.connection.once("open", () => {
            console.log(`MongoDB successfully connected to ${mongoUri}`);
        });
    });
}
exports.default = connectDb;
