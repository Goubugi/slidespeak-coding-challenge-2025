"use client";

import React, { useState } from "react";
import FileDropzone from "./FileDropzone";
import FileInfoCard from "./FileInfoCard";
import UploadScreen from "./UploadScreen";
import DownloadSuccess from "./DownloadSuccess";
import ErrorToast from "./ErrorToast";

export function PowerPointToPdfConverter() {
  const [status, setStatus] = useState<
    "idle" | "selected" | "uploading" | "done"
  >("idle");
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50 px-4">
      

      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {status === "idle" ? (
        <FileDropzone
          onFileSelected={(selectedFile) => {
            setFile(selectedFile);
            setStatus("selected");
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl text-center min-h-[320px] ">
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

          {status === "uploading" && file && <UploadScreen file={file} />}

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
