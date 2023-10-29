const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 5000;
const url =
  "mongodb+srv://jcrr1985:Tumama4$@cluster0.zi7qsgn.mongodb.net/feedbackdb";
app.use(cors());
app.use(express.json());

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

// Feedback Schema and Model
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  comment: { type: String, required: true },
});

const Feedback = mongoose.model("feedback", feedbackSchema);

// API Endpoint to handle form submission
app.post("/feedback", async (req, res) => {
  const { name, email, country, comment } = req.body;

  const newFeedback = new Feedback({
    name: name,
    email: email,
    country: country,
    comment: comment,
  });

  try {
    const feedback = await newFeedback.save();
    res.status(201).json({ mesage: "succesfully saved", feedback });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log("server started on port 5000");
});
