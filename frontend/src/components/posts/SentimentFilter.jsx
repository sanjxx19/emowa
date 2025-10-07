import React from "react";

export const SentimentFilter = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { value: null, label: "All Posts", color: "gray" },
        { value: "positive", label: "Positive", color: "green" },
        { value: "neutral", label: "Neutral", color: "gray" },
        { value: "negative", label: "Negative", color: "red" },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
                Filter by Sentiment
            </h3>
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value || "all"}
                        onClick={() => onFilterChange(filter.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            currentFilter === filter.value
                                ? `bg-${filter.color}-100 text-${filter.color}-800 border border-${filter.color}-200`
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
