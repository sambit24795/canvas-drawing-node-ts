"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
exports.userRoutes = router;
router.post("/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const userExists = await User_1.User.findOne({ username });
        if (userExists) {
            return res
                .status(409)
                .json({ message: "User already exists, choose a differnent name" });
        }
        const user = await User_1.User.build({ username, color: "#fff" }).save();
        res.status(402).json({ user });
    }
    catch (err) {
        console.error(err);
        res.status(502).json({});
    }
});
