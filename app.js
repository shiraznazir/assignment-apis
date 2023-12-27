const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const saltRounds = 10;

const app = express();

const uploadDirectory = "uploads/";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

app.use(express.json());

// routes

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    if (users.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: "Users not found" });
    }

    const data = users.map((item) => {
      return {
        name: item?.name,
        email: item?.email,
      };
    });

    res.status(200).json({ status: true, data: data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.post("/signup", upload.single("image"), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      path: filePath,
      image: originalName,
    });

    const savedUser = await newUser.save();

    const userData = {
      name: savedUser.name,
      email: savedUser.email,
    };

    res.status(200).json({
      status: true,
      message: "Signup successfully",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.query;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.status(200).json({ status: true, message: "Login successful" });
    } else {
      res.status(200).json({ status: false, message: "Incorrect password" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.use("/images", express.static("uploads"));

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://localhost:27017/db")
  .then(() => {
    console.log("Connected to database");
    app.listen(3000, () => {
      console.log("Server is up");
    });
  })
  .catch((err) => {
    console.log(err);
  });
