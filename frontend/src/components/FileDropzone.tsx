"use client";

import React, { useRef, useState } from "react";
import UploadIcon from "@/icons/UploadIcon";

export default function FileDropzone({
  onFileSelected,
  onError,
}: {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_SIZE_MB = 20;

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".pptx")) {
      onError("Only .pptx files are supported.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError("File size exceeds 20MB limit.");
      return;
    }

    onFileSelected(file);
  };

  return (
    <div
      className={`border-2 ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-dashed border-gray-300"
      } rounded-xl bg-white shadow-md p-10 w-full max-w-xl text-center min-h-[320px] flex flex-col items-center justify-center space-y-4 transition-colors`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      <div className="bg-gray-100 rounded-full p-6">
        <UploadIcon />
      </div>

      <p className="text-gray-600 text-sm">
        Drag and drop a PowerPoint file to convert to PDF.
      </p>

      <button
        className="bg-blue-100 text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-200"
        onClick={() => fileInputRef.current?.click()}
      >
        Choose file
      </button>

      <input
        type="file"
        accept=".ppt,.pptx"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
    </div>
  );
}
