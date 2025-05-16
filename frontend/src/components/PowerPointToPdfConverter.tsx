"use client";

import React, { useState, useEffect} from "react";
import FileDropzone from "./FileDropzone";
import FileInfoCard from "./FileInfoCard"; 
import UploadScreen from "./UploadScreen";
import DownloadSuccess from "./DownloadSuccess";


export function PowerPointToPdfConverter() {
  const [status, setStatus] = useState<"idle" | "selected" | "uploading" | "done">("idle");
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  useEffect(() => {
    if (status === "uploading" && file) {
      const timer = setTimeout(() => {
        setDownloadUrl("https://example.com/fake-converted.pdf");
        setStatus("done");
      }, 3000);

      return () => clearTimeout(timer); // cleanup if component unmounts
    }
  }, [status, file]);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl text-center">
      {status === "idle" && (
          <FileDropzone
            onFileSelected={(selectedFile) => {
              setFile(selectedFile);
              setStatus("selected");
            }}
          />
        )}
        
        {status === "selected" && file && (
          <FileInfoCard
            file={file}
            onCancel={() => {
              setFile(null);
              setStatus("idle");
            }}
            onConfirm={() => {
              setStatus("uploading");
              // call backend API to upload and convert
            }}
          />
        )}


        {status === "uploading" && file && (
          <UploadScreen
            file={file}
          />
        )}


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
    </div>
  );
}
