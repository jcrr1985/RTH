import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import FeedbackFormField from "./FeedbackFormField";

const proxy = "https://rth-server-d3n1.onrender.com";
// const proxy = "http://localhost:5000";

const FeedbackForm = ({ onSubmitSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const reusableSwal = (icon, title, timer) => {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: timer,
    });
  };

  const onSubmit = async (data) => {
    try {
      reusableSwal("", "Sending feedback...", 1500);
      const response = await axios.post(`${proxy}/feedback`, data);
      if (response.status === 201) {
        reusableSwal("success", "Feedback submitted successfully", 1500);
      } else {
        console.error("Error submitting feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
    onSubmitSuccess();
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="feedback-form">
        <FeedbackFormField
          label="Name"
          type="text"
          register={register}
          required={true}
          errors={errors}
          name="name"
        />
        <FeedbackFormField
          label="Email"
          type="email"
          register={register}
          required={true}
          errors={errors}
          name="email"
        />
        <FeedbackFormField
          label="Country"
          type="text"
          register={register}
          required={true}
          errors={errors}
          name="country"
        />
        <FeedbackFormField
          label="Comment"
          type="textarea"
          register={register}
          required={true}
          errors={errors}
          name="comment"
        />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
