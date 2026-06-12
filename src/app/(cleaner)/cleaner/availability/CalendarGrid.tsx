"use client";

import { useState } from "react";
import { addAvailability, deleteAvailability } from "../../actions";
import type { CleanerAvailability } from "@/types/database";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function get4Weeks(): Date[] {
  const monday = getMonday(new Date());
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isToday(d: Date): boolean {
  return toLocalDateStr(d) === toLocalDateStr(new Date());
}

function isPast(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

interface Props {
  slots: CleanerAvailability[];
}

export default function CalendarGrid({ slots: initialSlots }: Props) {
  const [slots, setSlots] = useState(initialSlots);
  const [modal, setModal] = useState<{ open: boolean; date: string }>({ open: false, date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMin, setEndMin] = useState("00");

  const days = get4Weeks();
  const weeks = Array.from({ length: 4 }, (_, w) => days.slice(w * 7, w * 7 + 7));

  const slotsByDate = slots.reduce<Record<string, CleanerAvailability[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("date", modal.date);
    formData.set("start_time", `${startHour}:${startMin}`);
    formData.set("end_time", `${endHour}:${endMin}`);
    const result = await addAvailability(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setModal({ open: false, date: "" });
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteAvailability(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <>
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-base font-bold text-gray-500 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* 4 weeks */}
      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {week.map((day) => {
              const dateStr = toLocalDateStr(day);
              const daySlots = slotsByDate[dateStr] ?? [];
              const past = isPast(day);
              const today = isToday(day);
              const isFirstOfMonth = day.getDate() === 1;

              return (
                <div
                  key={dateStr}
                  className={`rounded-xl border p-3 min-h-[110px] flex flex-col ${
                    past
                      ? "bg-gray-50 border-gray-100 opacity-50"
                      : daySlots.length > 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Date number */}
                  <div className="flex items-center gap-1 mb-2">
                    <span
                      className={`text-base font-bold rounded-full w-7 h-7 flex items-center justify-center ${
                        today
                          ? "bg-blue-600 text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {isFirstOfMonth && (
                      <span className="text-xs text-gray-400 font-medium">{MONTHS[day.getMonth()]}</span>
                    )}
                  </div>

                  {/* Slots */}
                  <div className="flex-1 space-y-1">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between bg-blue-100 rounded-lg px-2 py-1"
                      >
                        <span className="text-sm font-medium text-blue-700">
                          {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                        </span>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="text-red-400 hover:text-red-600 font-bold ml-1 leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add button */}
                  {!past && (
                    <button
                      onClick={() => setModal({ open: true, date: dateStr })}
                      className="mt-2 w-full text-center text-blue-500 hover:text-blue-700 text-lg font-bold leading-none"
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-base text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Add hours</h2>
            <p className="text-base text-gray-500 mb-6">{modal.date}</p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Start time</label>
                <div className="flex gap-2">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")).map((h) => (
                      <option key={h} value={h}>{h}:00</option>
                    ))}
                  </select>
                  <select
                    value={startMin}
                    onChange={(e) => setStartMin(e.target.value)}
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>:{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">End time</label>
                <div className="flex gap-2">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")).map((h) => (
                      <option key={h} value={h}>{h}:00</option>
                    ))}
                  </select>
                  <select
                    value={endMin}
                    onChange={(e) => setEndMin(e.target.value)}
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>:{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-base text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModal({ open: false, date: "" }); setError(null); }}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 text-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-3 text-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
