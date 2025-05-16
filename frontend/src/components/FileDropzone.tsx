import React from "react";

export default function FileDropzone({ onFileSelected }: { onFileSelected: (file: File) => void }) {
    return (
      <div>
        <input
          type="file"
          accept=".ppt,.pptx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
          }}
        />
      </div>
    );
  }
  