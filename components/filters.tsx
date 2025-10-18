"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FiltersProps {
  onFilterChange: (filter: "active" | "inactive" | "all") => void;
  className?: string;
}

export default function FilterComponent({
  onFilterChange,
  className,
}: FiltersProps) {
  const [activeFilter, setActiveFilter] = useState<
    "active" | "inactive" | "all"
  >("all");

  const handleFilterChange = (filter: "active" | "inactive" | "all") => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex rounded-full m-auto border overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => handleFilterChange("active")}
        className={cn(
          "px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
          activeFilter === "active"
            ? "bg-black/7 dark:bg-white/5"
            : "bg-transparent"
        )}
      >
        Active
      </button>
      <button
        onClick={() => handleFilterChange("inactive")}
        className={cn(
          "px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-l border-r border-white/20",
          activeFilter === "inactive"
            ? "bg-black/7 dark:bg-white/5"
            : "bg-transparent"
        )}
      >
        Inactive
      </button>
      <button
        onClick={() => handleFilterChange("all")}
        className={cn(
          "px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
          activeFilter === "all"
            ? "bg-black/7 dark:bg-white/5"
            : "bg-transparent"
        )}
      >
        All
      </button>
    </div>
  );
}
