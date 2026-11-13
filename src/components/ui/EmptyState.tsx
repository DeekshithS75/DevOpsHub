
export default function EmptyState({
  title = "Nothing here yet",
  description = "There is no data to display.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="text-3xl">📂</div>
      <h2 className="mt-3 font-semibold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}
