import React from "react";

export const SentimentFilter = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { value: null, label: "All Posts", color: "gray" },
        { value: "positive", label: "Positive", color: "green" },
        { value: "neutral", label: "Neutral", color: "gray" },
        { value: "negative", label: "Negative", color: "red" },
    ];

    const getFilterClass = (filter, isActive) => {
        if (isActive) {
            switch (filter.color) {
                case "green":
                    return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700";
                case "red":
                    return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
                default:
                    return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
            }
        }
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600";
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 transition-colors">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Filter by Sentiment
            </h3>
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value || "all"}
                        onClick={() => onFilterChange(filter.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${getFilterClass(filter, currentFilter === filter.value)}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
