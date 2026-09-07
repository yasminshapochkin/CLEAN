"use client";

import { useState } from "react";
import { StarRatingDisplay } from "@/components/StarRating";

export type ReviewItem = {
  id: string;
  score: number;
  reviewText: string;
  reviewerName: string;
  date: string;
};

const VISIBLE_COUNT = 3;

// Shows up to 3 reviews inline, with a "See all reviews" toggle to expand the
// rest in place — this page is otherwise a plain server component, so this
// small bit of interactivity is split out into its own client component.
export default function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? reviews : reviews.slice(0, VISIBLE_COUNT);
  const remaining = reviews.length - VISIBLE_COUNT;

  return (
    <div className="flex flex-col gap-4">
      {shown.map((r) => (
        <div key={r.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-sm font-semibold text-gray-900">{r.reviewerName}</p>
            <StarRatingDisplay value={r.score} size="sm" />
          </div>
          <p className="text-sm text-gray-600 italic">&ldquo;{r.reviewText}&rdquo;</p>
          <p className="text-xs text-gray-400 mt-1">{r.date}</p>
        </div>
      ))}
      {!expanded && remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 text-start"
        >
          See all reviews ({reviews.length})
        </button>
      )}
    </div>
  );
}
