const LoadMore = () => {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-3 rounded-full bg-gray-50 px-4 py-2 text-sm text-gray-600 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
        </span>
        Loading more results…
      </div>
    </div>
  );
};

export default LoadMore;
