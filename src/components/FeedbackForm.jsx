import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const FeedbackForm = ({ onSubmitSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/feedback", data);
      console.log("response", response);
      if (response.status === 201) {
        console.log("Feedback submitted successfully");

        // Realiza alguna acción en caso de éxito, como mostrar un mensaje de confirmación.
      } else {
        console.error("Error submitting feedback");
        // Realiza alguna acción en caso de error, como mostrar un mensaje de error.
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
    onSubmitSuccess();
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="feedback-form">
        <div className="form-group">
          <label className="ff-label" htmlFor="name">
            Name:
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className={` ff-input ${errors.name ? "error" : ""}`}
          />
          {errors.name && (
            <span className="error-msg">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label className="ff-label" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            {...register("email", { required: true })}
            className={`ff-input ${errors.email ? "error" : ""}`}
          />
          {errors.email && (
            <span className="error-msg">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label className="ff-label" htmlFor="country">
            Country:
          </label>
          <input
            type="text"
            {...register("country", { required: true })}
            className={`ff-input ${errors.country ? "error" : ""}`}
          />
          {errors.country && (
            <span className="error-msg">This field is required</span>
          )}
        </div>
        <div className="form-group">
          <label className="ff-label" htmlFor="comment">
            Comment:
          </label>
          <textarea
            {...register("comment", { required: true })}
            className={`ff-input ${errors.comment ? "error" : ""}`}
          ></textarea>
          {errors.comment && (
            <span className="error-msg">This field is required</span>
          )}
        </div>
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
