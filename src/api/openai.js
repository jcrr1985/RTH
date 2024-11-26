import axios from "axios";

const getDiagnosis = async (symptoms) => {
  try {
    const response = await axios.post(
      "https://rth-server.vercel.app/api/getDiagnosis",
      {
        symptoms,
      }
    );

    return response.data.diagnosis;
  } catch (error) {
    console.error("Error fetching diagnosis:", error);
    throw error;
  }
};

export default getDiagnosis;
