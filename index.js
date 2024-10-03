const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { z } = require("zod")

mongoose.connect(
  "mongodb+srv://loginsureshadhikari:GlX7Qd4zifIvjOXl@cluster0.zjjj9.mongodb.net/Suresh"
);

const SECRET_KEY = "This_is_Secrete";
const app = express();
app.use(express.json());

app.post("/signUp", async function (req, res) {
  try {
    const requiredBody = z.object({
      email: z.string().email(),
      password: z.string().min(4).max(50),
      name: z.string().min(2).max(100),
    })
    //const parsedData = requiredBody.parse(req.body)
    const paarsedDataWithSuccess = requiredBody.safeParse(req.body)
    if(!paarsedDataWithSuccess){
      res.json({
        message:"Invalid Format",
        error:paarsedDataWithSuccess.error
      })
      return;
    }
    const { email, password, name } = req.body;

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });

    res.status(201).json({
      message: "SignUp successful",
      email: email,
      name: name,
    });
  } catch (error) {
    console.error("SignUp Error: ", error);
    res.status(500).json({ message: "Internal server error during sign up" });
  }
});

app.post("/signIn", async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (passwordMatched) {
      const token = jwt.sign({ id: user._id.toString() }, SECRET_KEY);
      res.json({ message: "You are logged in", token: token });
    } else {
      res.status(401).json({ message: "Incorrect credentials" });
    }
  } catch (error) {
    console.error("SignIn Error: ", error);
    res.status(500).json({ message: "Internal server error during sign in" });
  }
});

function auth(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decodedData = jwt.verify(token, SECRET_KEY);
    req.userId = decodedData.id;
    next();
  } catch (error) {
    console.error("Auth Error: ", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.post("/todo", auth, async function (req, res) {
  try {
    const { title } = req.body;
    const userId = req.userId;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    await TodoModel.create({
      userId: userId,
      title: title,
    });

    res.status(201).json({ message: "Todo created successfully" });
  } catch (error) {
    console.error("Create Todo Error: ", error);
    res
      .status(500)
      .json({ message: "Internal server error during todo creation" });
  }
});

app.get("/todos", auth, async function (req, res) {
  try {
    const userId = req.userId;
    const todos = await TodoModel.find({ userId: userId });

    res.json(todos);
  } catch (error) {
    console.error("Get Todos Error: ", error);
    res
      .status(500)
      .json({ message: "Internal server error during fetching todos" });
  }
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
