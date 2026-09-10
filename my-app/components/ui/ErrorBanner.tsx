type ErrorBannerProps = {
  message: string;
  isStale: boolean;
  onRetry: () => void;
};

export const ErrorBanner = ({
  message,
  isStale,
  onRetry,
}: ErrorBannerProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/40">
      <div>
        <p className="font-medium text-red-800 dark:text-red-300">
          Could not reach the server
        </p>
        <p className="text-red-700 dark:text-red-400">
          {message}
          {isStale ? ". Showing the last data received." : "."}
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-red-400 px-3 py-1.5 font-medium text-red-800 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
      >
        Retry
      </button>
    </div>
  );
};
