export const TableSkeleton = () => {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading portfolio">
      <div className="h-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />

      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900"
        />
      ))}
    </div>
  );
};
