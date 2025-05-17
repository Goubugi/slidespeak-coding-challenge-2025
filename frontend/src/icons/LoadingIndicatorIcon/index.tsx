export default function LoadingIndicatorIcon({
  className = "w-6 h-6 text-blue-600",
}) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 50 50"
      fill="none"
    >
      <circle
        className="text-gray-200"
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
      />
      <path
        d="M45 25a20 20 0 0 1-20 20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="text-blue-600"
        fill="none"
      />
    </svg>
  );
}
