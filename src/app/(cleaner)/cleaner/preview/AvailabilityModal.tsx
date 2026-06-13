"use client";

import { useState } from "react";
import type { CleanerAvailability, CleanerWeeklyAvailability } from "@/types/database";
import { slotLabel } from "../availability/utils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayInfo {
  dateStr: string;
  dayNum: number;
  monthName: string | null;
}

interface Props {
  weeks: DayInfo[][];
  slots: CleanerAvailability[];
  weeklySlots: CleanerWeeklyAvailability[];
}

export default function AvailabilityModal({ weeks, slots, weeklySlots }: Props) {
  const [open, setOpen] = useState(false);

  const slotsByDate = slots.reduce<Record<string, CleanerAvailability[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-blue-600 text-white text-lg font-semibold rounded-2xl py-4 hover:bg-blue-700 transition-colors"
      >
        View Availability
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Availability</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-2xl text-gray-400 hover:text-gray-700 font-bold leading-none"
            >
              ✕
            </button>
          </div>

          {/* Calendar — no side padding, full width */}
          <div className="flex-1 overflow-y-auto">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-gray-500 py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="divide-y divide-gray-100">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 divide-x divide-gray-100">
                  {week.map((day) => {
                    const daySlots = slotsByDate[day.dateStr] ?? [];
                    const dow = new Date(day.dateStr + "T12:00:00").getDay();
                    const recurring = weeklySlots.filter((s) => s.day_of_week === dow);
                    const hasAny = daySlots.length > 0 || recurring.length > 0;
                    return (
                      <div
                        key={day.dateStr}
                        className={`min-h-[70px] p-1 flex flex-col ${hasAny ? "bg-blue-50" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-0.5 mb-1">
                          <span className="text-xs font-bold text-gray-700">{day.dayNum}</span>
                          {day.monthName && (
                            <span className="text-[10px] text-gray-400">{day.monthName}</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {recurring.map((slot) => (
                            <div key={slot.id} className="bg-blue-500 rounded px-0.5 py-0.5">
                              <span className="text-[10px] font-medium text-white leading-none">
                                {slotLabel(slot.start_time, slot.end_time)[0]}
                              </span>
                            </div>
                          ))}
                          {daySlots.map((slot) => (
                            <div key={slot.id} className="bg-blue-500 rounded px-0.5 py-0.5">
                              <span className="text-[10px] font-medium text-white leading-none">
                                {slotLabel(slot.start_time, slot.end_time)[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
