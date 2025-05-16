import { CheckIcon } from "@/icons/CheckIcon";
import { PdfIcon } from "@/icons/PdfIcon";

type Props = {
    downloadUrl: string;
    onReset: () => void;
  };
  
  export default function DownloadSuccess({ downloadUrl, onReset }: Props) {
    return (
        <div className="space-y-6">
        {/* PDF Icon and Success Text */}
        <div className="border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
          {/* PDF icon with check overlay */}
          <div className="relative w-20 h-20">
            <PdfIcon />
            <div className="absolute bottom-2 left-1/2 transform -translate-x-[60%] translate-y-1/2">
                <CheckIcon />
            </div>
            </div>
  
          <p className="text-xl font-semibold">File converted successfully!</p>
        </div>
  
        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <button
            className="w-1/2 border border-gray-300 rounded-xl py-2 text-gray-700 hover:bg-gray-100"
            onClick={onReset}
          >
            Convert another
          </button>
          <button
            className="w-1/2 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700"
            onClick={() => window.open(downloadUrl, "_blank")}
          >
            Download file
          </button>
        </div>
      </div>
    );
  }
  