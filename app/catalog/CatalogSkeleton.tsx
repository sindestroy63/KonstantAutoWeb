export function CatalogSkeleton() {
  return (
    <>
      <div className="mb-8 h-24 rounded-xl bg-gray-200 animate-pulse" />
      <p className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-10 bg-gray-100 rounded mt-4 animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
