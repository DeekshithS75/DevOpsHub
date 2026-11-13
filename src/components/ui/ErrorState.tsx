
export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center text-center">
      <div className="text-3xl">!</div>
      <h2 className="mt-3 text-lg font-semibold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
