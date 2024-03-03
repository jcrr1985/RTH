const FeedbackFormField = ({
  label,
  type,
  register,
  required,
  errors,
  name,
}) => (
  <div className="form-group">
    <label className="ff-label" htmlFor={name}>
      {label}:
    </label>
    <input
      type={type}
      {...register(name, { required })}
      className={`ff-input ${errors[name] ? "error" : ""}`}
    />
    {errors[name] && <span className="error-msg">This field is required</span>}
  </div>
);

export default FeedbackFormField;
