"use client";

import React, { useState } from "react";
import FileDropzone from "./FileDropzone";
import FileInfoCard from "./FileInfoCard";
import UploadScreen from "./UploadScreen";
import DownloadSuccess from "./DownloadSuccess";
import ErrorToast from "./ErrorToast";

//Overall, component is 4 status to change between which subcomponent it renders
export function PowerPointToPdfConverter() {
  const [status, setStatus] = useState<
    "idle" | "selected" | "uploading" | "done"
  >("idle");
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    //Loads error message if anything goes wrong
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50 px-4">
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Initial entry point, user drags or selects .pptx to upload*/}
      {status === "idle" ? (
        <FileDropzone
          onFileSelected={(file) => {
            setFile(file);
            setStatus("selected");
          }}
          onError={(message) => {
            setErrorMessage(message);
            setFile(null);
            setStatus("idle");
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl text-center min-h-[320px] ">
          {/* User has selected a valid file, have them confirm if they want to convert this.*/}
          {status === "selected" && file && (
            <FileInfoCard
              file={file}
              setStatus={setStatus}
              setDownloadUrl={setDownloadUrl}
              setErrorMessage={setErrorMessage}
              onCancel={() => {
                setFile(null);
                setStatus("idle");
              }}
            />
          )}
          {/* The backend is currently working, status of job id is checked every 2 seconds*/}
          {status === "uploading" && file && <UploadScreen file={file} />}

          {/* The file is finished converting and the presigned URL is available.*/}
          {status === "done" && downloadUrl && (
            <DownloadSuccess
              downloadUrl={downloadUrl}
              onReset={() => {
                setStatus("idle");
                setFile(null);
                setDownloadUrl("");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
