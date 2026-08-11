import { useId } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AiProcessingPanel, motionTokens } from "./MotionSystem";

function FileUpload({
  label,
  onFileChange,
  fileName,
  helper = "PDF only. Text-based resumes work best.",
  statusMessage = "",
  statusTone = "default",
}) {
  const inputId = useId();
  const isBusy = statusTone === "info";

  return (
    <motion.div
      className="upload-card"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={motionTokens.spring}
    >
      <span className="upload-label">{label}</span>
      <motion.label
        htmlFor={inputId}
        className={`upload-dropzone ${isBusy ? "upload-dropzone--busy" : ""}`}
        whileHover={{ y: -2, scale: 1.006 }}
        whileTap={{ scale: 0.99 }}
        transition={motionTokens.spring}
      >
        <motion.span
          className="upload-dropzone__icon"
          aria-hidden="true"
          animate={isBusy ? { y: [0, -4, 0], scale: [1, 1.04, 1] } : { y: 0, scale: 1 }}
          transition={{ duration: 1.2, repeat: isBusy ? Infinity : 0 }}
        >
          <UploadCloud size={24} />
        </motion.span>
        <span className="upload-dropzone__button">
          <FileUp size={17} aria-hidden="true" />
          Choose PDF
        </span>
        <span className="upload-dropzone__text">
          {fileName || "Select a resume PDF from your device"}
        </span>
      </motion.label>
      <input
        id={inputId}
        className="upload-input"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />
      <span className="upload-meta">{helper}</span>
      <AnimatePresence>
        {isBusy ? (
          <AiProcessingPanel
            title="Scanning resume PDF"
            stages={["Uploading file...", "Reading PDF text...", "Finding resume sections...", "Saving parsed text..."]}
            tone="scan"
            compact
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {statusMessage && !isBusy ? (
          <motion.span
            className={`upload-status upload-status--${statusTone}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {statusMessage}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default FileUpload;
