import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/user.model.js";
import ProfileModel from "./models/profiles.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    console.log(`DB connected!`);

    app.listen(process.env.PORT, () => {
      console.log(`App is running at http://localhost:${process.env.PORT}`);
    });

    // Middleware xác thực
    const authenticate = (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token)
        return res.status(401).json({ message: "Access token missing" });

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
      });
    };

    // /register
    app.post("/register", async (req, res) => {
      try {
        const { username, password } = req.body;

        if (!username || !password)
          return res.status(400).json({ message: "Missing input" });

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({ username, hashPassword });

        res.status(200).json(newUser);
      } catch (error) {
        console.log(error);
        return res.json(error);
      }
    });

    // /login
    app.post("/login", async (req, res) => {
      try {
        const { username, password } = req.body;

        if (!username || !password)
          return res.status(400).json({ message: "Missing input" });

        const user = await UserModel.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        const isValidPassword = await bcrypt.compare(
          password,
          user.hashPassword
        );

        if (!isValidPassword)
          return res.status(401).json({ message: "Invalid password" });

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(200).json({ accessToken });
      } catch (err) {
        console.log(err);
        return res.json(err);
      }
    });

    // logout
    app.post("/logout", authenticate, (req, res) => {
      try {
        res.status(200).json({ message: "Logged out successfully" });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });

    // create new user profile
    app.post("/profiles", authenticate, async (req, res) => {
      try {
        const newProfile = await ProfileModel.create({
          ...req.body,
          userId: req.user.id,
        });
        res.status(200).json(newProfile);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });

    // get the information profile of current user
    app.get("/profiles/me", authenticate, async (req, res) => {
      try {
        const profile = await ProfileModel.findOne({ userId: req.user.id });
        res.status(200).json(profile);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });

    // get all profiles information
    app.get("/profiles", authenticate, async (req, res) => {
      try {
        const profiles = await ProfileModel.find().select("-userId");
        res.status(200).json(profiles);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });

    // get all profiles information
    app.get("/profiles", authenticate, async (req, res) => {
      try {
        const profiles = await ProfileModel.find();
        res.status(200).json(profiles);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });

    // update current user profile
    app.put("/profiles/me", authenticate, async (req, res) => {
      try {
        const updatedProfile = await ProfileModel.findOneAndUpdate(
          { userId: req.user.id },
          req.body,
          { new: true }
        );
        res.status(200).json(updatedProfile);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });

    // delete current user profile
    app.delete("/profiles/me", authenticate, async (req, res) => {
      try {
        await ProfileModel.findOneAndDelete({ userId: req.user.id });
        res.status(200).json({ message: "Profile deleted" });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
