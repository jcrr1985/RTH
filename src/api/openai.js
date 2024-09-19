import axios from "axios";

const apiKey = "distilbert-base-uncased";
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

    // Check the structure of the response to extract generated text
    // This is a common structure for Hugging Face responses but may vary
    const result = response.data;
    let diagnosis;

    if (result && Array.isArray(result) && result.length > 0) {
      // GPT-2 models might return the result in an array or a different structure
      diagnosis = result[0].generated_text || result[0].text;
    } else if (result && typeof result === "object" && result.text) {
      // Handle cases where response is an object with text field
      diagnosis = result.text;
    } else {
      // Fallback to logging the full response
      console.log("Unexpected response format:", result);
      diagnosis = "Unable to retrieve diagnosis.";
    }

    console.log(diagnosis);
    return diagnosis;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default getDiagnosis;
