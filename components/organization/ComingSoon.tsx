
interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({
  title,
  description,
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
          🚀
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {title}
        </h1>

        <p className="mt-3 text-gray-500">
          {description}
        </p>

        <span className="mt-5 inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
