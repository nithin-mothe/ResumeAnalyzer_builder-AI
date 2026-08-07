import { useId } from "react";
import { FileUp, UploadCloud } from "lucide-react";

function FileUpload({
  label,
  onFileChange,
  fileName,
  helper = "PDF only. Text-based resumes work best.",
  statusMessage = "",
  statusTone = "default",
}) {
  const inputId = useId();

  return (
    <div className="upload-card">
      <span className="upload-label">{label}</span>
      <label htmlFor={inputId} className="upload-dropzone">
        <span className="upload-dropzone__icon" aria-hidden="true">
          <UploadCloud size={24} />
        </span>
        <span className="upload-dropzone__button">
          <FileUp size={17} aria-hidden="true" />
          Choose PDF
        </span>
        <span className="upload-dropzone__text">
          {fileName || "Select a resume PDF from your device"}
        </span>
      </label>
      <input
        id={inputId}
        className="upload-input"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />
      <span className="upload-meta">{helper}</span>
      {statusMessage ? <span className={`upload-status upload-status--${statusTone}`}>{statusMessage}</span> : null}
    </div>
  );
}

export default FileUpload;
