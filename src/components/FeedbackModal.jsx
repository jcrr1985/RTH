import React, { useState } from "react";
import Modal from "react-modal";
import FeedbackForm from "./FeedbackForm";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
const FeedbackModal = React.memo(() => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const toggleModal = () => {
    setModalIsOpen((prevModalState) => !prevModalState);
  };
  const handleSubmitSuccess = () => {
    setModalIsOpen(false);
  };

  return (
    <div>
      <div className="circle-logo" onClick={toggleModal}>
        <span role="img" aria-label="Attention" style={{ height: "22px" }}>
          <FavoriteBorderIcon />
        </span>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={toggleModal}
        contentLabel="Feedback Form"
        className="modal"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "-5px",
          }}
        >
          <span onClick={toggleModal} style={{ marginTop: "-5px" }}>
            <CloseIcon className="close-icon" />
          </span>
        </div>
        <FeedbackForm onSubmitSuccess={handleSubmitSuccess} />
      </Modal>
    </div>
  );
});

export default FeedbackModal;
