export default function ErrorToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  //Component for error messages that pop up on the top when an error is thrown.
  return (
    <div className="absolute top-6 bg-red-100 text-red-800 px-4 py-2 rounded shadow-md">
      {message}
      <button onClick={onClose} className="ml-4 text-sm underline">
        Dismiss
      </button>
    </div>
  );
}
