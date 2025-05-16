"use client";
import axios from "axios";

import React, { useState} from "react";
import FileDropzone from "./FileDropzone";
import FileInfoCard from "./FileInfoCard"; 
import UploadScreen from "./UploadScreen";
import DownloadSuccess from "./DownloadSuccess";



export function PowerPointToPdfConverter() {
  const [status, setStatus] = useState<"idle" | "selected" | "uploading" | "done">("idle");
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  return (
    
      <div className="fixed inset-0 flex justify-center items-center bg-gray-50 px-4">
        {/* 🔴 Error popup here */}
        {errorMessage && (
              <div className="absolute top-6 bg-red-100 text-red-800 px-4 py-2 rounded shadow-md">
                {errorMessage}
                <button
                  onClick={() => setErrorMessage(null)}
                  className="ml-4 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            )}

        {status === "idle" ? (
            <FileDropzone
                onFileSelected={(selectedFile) => {
                  setFile(selectedFile);
                  setStatus("selected");
                }}
              />
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl text-center min-h-[320px] ">
            {status === "selected" && file && (
              <FileInfoCard
                file={file}
                onCancel={() => {
                  setFile(null);
                  setStatus("idle");
                }}
                onConfirm={async () => {
                  if (!file) return;
                
                  try {
                    setStatus("uploading");
                
                    const formData = new FormData();
                    formData.append("file", file);
                
                    // Call backend /upload
                    const response = await axios.post(
                      `${BACKEND_URL}/upload`,
                      formData,
                      {
                        headers: { "Content-Type": "multipart/form-data" },
                      }
                    );
                
                    const { job_id } = response.data;
                
                    // Start polling backend for status
                    const interval = setInterval(async () => {
                      try {
                        const statusRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/status/${job_id}`);
                        const jobStatus = statusRes.data;
                    
                        if (jobStatus.status === "done") {
                          clearInterval(interval);
                          setDownloadUrl(jobStatus.download_url);
                          setStatus("done");
                        } else if (jobStatus.status === "error") {
                          clearInterval(interval);
                          setErrorMessage("Something went wrong while converting. Please try again.");
                          console.error("Conversion failed:", jobStatus.error);
                          setStatus("idle"); 
                        } else {
                          console.log("Sent request, backend is still working")
                        }
                      } catch (pollErr) {
                        clearInterval(interval); 
                        setErrorMessage("Something went wrong while converting. Please try again.");
                        console.error("Polling failed:", pollErr);
                        setStatus("idle");
                      }
                    }, 2000);
                    
                  } catch (err) {

                    console.error("Upload failed:", err);
                    setErrorMessage("Something went wrong while converting. Please try again.");
                    setStatus("idle");
                  }
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

