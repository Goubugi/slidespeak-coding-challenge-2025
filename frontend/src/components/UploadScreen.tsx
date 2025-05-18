import { ButtonLoading } from "@/icons/ButtonLoading";
import LoadingIndicatorIcon from "@/icons/LoadingIndicatorIcon";

type Props = {
  file: File;
};

export default function UploadScreen({ file }: Props) {
  return (
    <div className="space-y-4">
      {/* File info with size */}
      <div className="border rounded-2xl px-6 py-4 shadow-sm">
        <p className="font-semibold text-lg text-center">{file.name}</p>
        <p className="text-sm text-gray-500 text-center">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {/* Animated loading indicator icon to spin around */}
      <div className="border rounded-xl p-4 min-h-[80px] flex items-center">
        <div className="flex items-center gap-3">
          <LoadingIndicatorIcon className="w-6 h-6 animate-spin" />
          <div>
            <p className="font-semibold">Converting your file…</p>
          </div>
        </div>
      </div>

      {/* Buttons, both disabled. One is the cancel button, and the other is the animated spinning */}
      <div className="flex justify-between gap-4">
        <button
          disabled
          className="w-1/2 border border-gray-300 rounded-xl py-2 text-gray-400 cursor-not-allowed bg-gray-100"
        >
          Cancel
        </button>
        <button
          disabled
          className="w-1/2 bg-blue-300 text-white rounded-xl py-2 cursor-not-allowed flex items-center justify-center"
        >
          <ButtonLoading className="w-6 h-6 text-white-600" />
        </button>
      </div>
    </div>
  );
}
