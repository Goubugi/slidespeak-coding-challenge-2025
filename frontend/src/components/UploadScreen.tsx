import  LoadingIndicatorIcon  from "@/icons/LoadingIndicatorIcon";

type Props = {
  file: File;
};

export default function UploadScreen({ file }: Props) {
  return (
    <div className="space-y-4">
      {/* File info */}
      <div className="border p-4 rounded text-left">
        <p className="font-semibold">{file.name}</p>
        <p className="text-sm text-gray-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {/* Conversion notice with spinner */}
      <div className="border rounded p-4 flex items-center gap-2 text-left">
      <LoadingIndicatorIcon className="w-10 h-10 text-blue-600" />


        <p className="text-sm text-gray-700">Converting your file…</p>
      </div>

      {/* Disabled buttons */}
      <div className="flex justify-between">
        <button
          disabled
          className="border border-gray-300 rounded px-4 py-2 text-gray-400 cursor-not-allowed bg-gray-100"
        >
          Cancel
        </button>
        <button
          disabled
          className="bg-blue-300 text-white px-4 py-2 rounded cursor-not-allowed"
        >
          Convert
        </button>
      </div>
    </div>
  );
}
