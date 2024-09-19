import axios from "axios";

const apiKey = "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";
const model = "gpt2"; // Replace with your chosen model

const getDiagnosis = async (symptoms) => {
  const data = {
    inputs: `The patient is experiencing the following symptoms: ${symptoms}. Please provide multiple possible diagnoses.`,
  };

  const config = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      data,
      config
    );
    const result = response.data;
    const diagnosis = result[0].generated_text; // Adjust based on the API response format
    console.log(diagnosis);
    return diagnosis;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default getDiagnosis;
