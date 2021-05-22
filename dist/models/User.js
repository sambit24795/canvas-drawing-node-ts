"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const randomColor_1 = __importDefault(require("../utils/randomColor"));
const usersSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, "A username must be provided"],
    },
    color: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform(_doc, ret) {
            (ret.id = ret._id), Reflect.deleteProperty(ret, "_id");
        },
    },
});
usersSchema.pre("save", function (done) {
    if (this.isModified("username")) {
        const randomColor = randomColor_1.default();
        this.set("color", randomColor);
    }
    done();
});
usersSchema.statics.build = (attrs) => {
    return new User(attrs);
};
const User = mongoose_1.default.model("User", usersSchema);
exports.User = User;
