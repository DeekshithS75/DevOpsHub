
export default function LoadingState({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div
      role="status"
      className="flex min-h-64 flex-col items-center justify-center gap-3"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
