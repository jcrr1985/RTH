import axios from "axios";

const apiKey = "bd71dd9e6bda4d7d82ca625453e1480a";

const getDiagnosis = async (symptoms) => {
  const data = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a medical assistant. Provide multiple possible diagnoses based on the given symptoms. Be clear and concise.",
      },
      {
        role: "user",
        content: `The patient is experiencing the following symptoms: ${symptoms}. Please provide multiple possible diagnoses.`,
      },
    ],
    max_tokens: 512,
    stream: false,
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };

  try {
    const response = await axios.post(
      "https://api.aimlapi.com/chat/completions",
      data,
      config
    );
    console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default getDiagnosis;
