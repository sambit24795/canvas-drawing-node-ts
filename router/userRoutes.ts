import express, { Request, Response } from "express";
import { User } from "../models/User";

const router = express.Router();

router.post("/:username", async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res
        .status(409)
        .json({ message: "User already exists, choose a differnent name" });
    }

    const user = await User.build({ username, color: "#fff" }).save();

    res.status(402).json({ user });
  } catch (err) {
    console.error(err);
    res.status(502).json({});
  }
});

export { router as userRoutes };
