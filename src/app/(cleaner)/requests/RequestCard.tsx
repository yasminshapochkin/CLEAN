"use client";

import { useState, useEffect } from "react";
import { respondToBooking } from "../actions";
import type { BookingWithCustomer, BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function Countdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function update() {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}h ${m}m left`);
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [deadline]);

  return <span className="text-xs text-orange-500 font-medium">{remaining}</span>;
}

interface Props {
  booking: BookingWithCustomer;
  showActions: boolean;
}

export default function RequestCard({ booking, showActions }: Props) {
  const [loading, setLoading] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(booking.status);

  async function handleRespond(response: "accepted" | "declined") {
    setLoading(response);
    setError(null);
    const result = await respondToBooking(booking.id, response);
    if (result?.error) {
      setError(result.error);
    } else {
      setCurrentStatus(response);
    }
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {booking.profiles?.full_name ?? "Customer"}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{booking.address}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[currentStatus]}`}
          >
            {currentStatus}
          </span>
          {currentStatus === "pending" && (
            <Countdown deadline={booking.response_deadline} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
        <div>
          <span className="text-gray-400">Date</span>
          <div className="font-medium">{booking.scheduled_date}</div>
        </div>
        <div>
          <span className="text-gray-400">Time</span>
          <div className="font-medium">{booking.scheduled_start?.slice(0, 5)}</div>
        </div>
        <div>
          <span className="text-gray-400">Duration</span>
          <div className="font-medium">{booking.duration_hours}h</div>
        </div>
      </div>

      {booking.notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
          {booking.notes}
        </p>
      )}

      {currentStatus === "accepted" && booking.profiles?.phone && (
        <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3">
          Customer contact: {booking.profiles.phone}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}

      {showActions && currentStatus === "pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespond("accepted")}
            disabled={!!loading}
            className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading === "accepted" ? "Accepting..." : "Accept"}
          </button>
          <button
            onClick={() => handleRespond("declined")}
            disabled={!!loading}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loading === "declined" ? "Declining..." : "Decline"}
          </button>
        </div>
      )}
    </div>
  );
}
