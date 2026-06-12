import React from "react";
import { useNavigate } from "react-router-dom";

export default function NoRecordFound({
  buttonText = "Refresh",
  onAction,
  href,
  title = "No Results Found",
  message = "We couldn't find any matching events. Try adjusting your filters, search term, or exchange selection."
}) {

  const router = useNavigate();

  const handleClick = () => {
    if (onAction) return onAction();
    if (href) return router(href);
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="w-full flex justify-center lg:my-8 my-5">
      <div className="bg-white/90 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-10 w-full text-center">
        
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-3xl">🔍</span>
          </div>
        </div>

        <h2 className="mt-5 text-xl font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h2>

        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">

          <button
            onClick={handleClick}
            className="px-4 py-2 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            {buttonText}
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-4 py-2 cursor-pointer rounded-lg border border-gray-500 dark:border-gray-600
            hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300
            text-sm font-medium transition"
          >
            Go to Top
          </button>
        </div>

      </div>
    </div>
  );
}
