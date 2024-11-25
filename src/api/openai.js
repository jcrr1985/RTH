import cohere from "cohere-ai";

const COHERE_API_KEY = "MKiQ4ky0IkOOh7PARHLwBfEtXMWBvR0PuIFodmB3";
cohere.init(COHERE_API_KEY);

const getDiagnosis = async (symptoms) => {
  const prompt = `The patient is experiencing the following symptoms: ${symptoms}. Please provide multiple possible diagnoses.`;

  try {
    const response = await cohere.generate({
      model: "command-xlarge-nightly",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.5,
    });

    const diagnosis = response.body.generations[0].text.trim();
    console.log(diagnosis);
    return diagnosis;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default getDiagnosis;
