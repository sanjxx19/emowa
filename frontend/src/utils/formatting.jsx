import React from "react";
import { Smile, Meh, Frown } from "lucide-react";

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
        case "positive":
            return <Smile className="w-4 h-4 text-green-500" />;
        case "negative":
            return <Frown className="w-4 h-4 text-red-500" />;
        default:
            return <Meh className="w-4 h-4 text-gray-500" />;
    }
};

export const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
        case "positive":
            return "bg-green-100 text-green-800 border-green-200";
        case "negative":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};
