const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

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
  console.warn("in post feedback");
  const { name, email, country, comment } = req.body;

  const newFeedback = new Feedback({
    name,
    email,
    country,
    comment,
  });

  console.log("newFeedback", newFeedback);

  try {
    const feedback = await newFeedback.save();
    console.log("feedback", feedback);
    res.status(201).json({ mesage: "succesfully saved", feedback });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/places", async (req, res) => {
  // const apiUrl = req.query.apiUrl;

  const apiKey = "AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k";

  const apiUrl = `${req.query.apiUrl}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    console.log("response.data", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error al hacer la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log("server started on port 5000");
});
