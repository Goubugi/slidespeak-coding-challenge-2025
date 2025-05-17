import axios from "axios";

type Props = {
  file: File;
  setStatus: (status: "idle" | "uploading" | "done") => void;
  setDownloadUrl: (url: string) => void;
  setErrorMessage: (msg: string) => void;
  onCancel: () => void;
};

export default function FileInfoCard({
  file,
  setStatus,
  setDownloadUrl,
  setErrorMessage,
  onCancel,
}: Props) {
  const handleConfirm = async () => {
    try {
      setStatus("uploading");

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${BACKEND_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { job_id } = res.data;
      let attempts = 0;
      const maxAttempts = 30;

      const interval = setInterval(async () => {
        try {
          attempts++;
          if (attempts > maxAttempts) {
            clearInterval(interval);
            setErrorMessage("Conversion timed out. Please try again.");
            setStatus("idle");
            return;
          }
          const statusRes = await axios.get(`${BACKEND_URL}/status/${job_id}`);
          const jobStatus = statusRes.data;

          if (jobStatus.status === "done") {
            clearInterval(interval);
            setDownloadUrl(jobStatus.download_url);
            setStatus("done");
          } else if (jobStatus.status === "error") {
            clearInterval(interval);
            setErrorMessage(
              "Something went wrong while converting. Please try again.",
            );
            setStatus("idle");
          }
        } catch (pollErr) {
          clearInterval(interval);
          setErrorMessage(
            "Something went wrong while converting. Please try again.",
          );
          setStatus("idle");
        }
      }, 2000);
    } catch (err) {
      setStatus("idle");
      setErrorMessage(
        "Something went wrong while converting. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* File Info Box */}
      <div className="border rounded-2xl px-6 py-4 shadow-sm">
        <p className="font-semibold text-lg text-center">{file.name}</p>
        <p className="text-sm text-gray-500 text-center">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {/* Convert Option Box */}
      <div className="bg-blue-50 rounded-xl border border-blue-300 p-4 text-left space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border-4 border-blue-600"></div>{" "}
          <p className="text-blue-700 font-semibold">Convert to PDF</p>
        </div>

        <p className="text-sm text-blue-600 pl-6">
          Best quality, retains images and other assets.
        </p>
      </div>

      <div className="flex justify-between gap-4">
        <button
          className="flex-1 border border-gray-300 rounded-xl py-2 text-gray-700 hover:bg-gray-100"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="flex-1 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700"
          onClick={handleConfirm}
        >
          Convert
        </button>
      </div>
    </div>
  );
}
