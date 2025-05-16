type Props = {
    file: File;
    onCancel: () => void;
    onConfirm: () => void;
  };
  
  export default function FileInfoCard({ file, onCancel, onConfirm }: Props) {
    return (
      <div className="space-y-4">
        <div className="border p-4 rounded text-left">
          <p className="font-semibold">{file.name}</p>
          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
  
        <div className="bg-blue-50 rounded p-3 text-left">
          <p className="font-medium text-blue-700">Convert to PDF</p>
          <p className="text-sm text-blue-600">Best quality, retains images and other assets.</p>
        </div>
  
        <div className="flex justify-between">
          <button
            className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={onConfirm}
          >
            Convert
          </button>
        </div>
      </div>
    );
  }