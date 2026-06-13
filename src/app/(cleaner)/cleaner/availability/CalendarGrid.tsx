"use client";

import { useState } from "react";
import { addAvailability, deleteAvailability } from "../../actions";
import type { CleanerAvailability, CleanerWeeklyAvailability } from "@/types/database";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date): boolean {
  return toLocalDateStr(d) === toLocalDateStr(new Date());
}

function isPast(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function getDayName(d: Date): string {
  return WEEK_DAYS[(d.getDay() + 6) % 7];
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${WEEK_DAYS[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

interface Props {
  slots: CleanerAvailability[];
  weeklySlots: CleanerWeeklyAvailability[];
}

interface DayPanel {
  open: boolean;
  dateStr: string;
  past: boolean;
}

export default function CalendarGrid({ slots: initialSlots, weeklySlots }: Props) {
  const [slots, setSlots] = useState(initialSlots);
  const [columns, setColumns] = useState(7);
  const [panel, setPanel] = useState<DayPanel>({ open: false, dateStr: "", past: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMin, setEndMin] = useState("00");

  const days = get4Weeks();
  const rows: Date[][] = [];
  for (let i = 0; i < days.length; i += columns) {
    rows.push(days.slice(i, i + columns));
  }

  const slotsByDate = slots.reduce<Record<string, CleanerAvailability[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  function openPanel(day: Date) {
    setError(null);
    setStartHour("08");
    setStartMin("00");
    setEndHour("17");
    setEndMin("00");
    setPanel({ open: true, dateStr: toLocalDateStr(day), past: isPast(day) });
  }

  function closePanel() {
    setPanel({ open: false, dateStr: "", past: false });
    setError(null);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("date", panel.dateStr);
    formData.set("start_time", `${startHour}:${startMin}`);
    formData.set("end_time", `${endHour}:${endMin}`);
    const result = await addAvailability(formData);
    if (result?.error) {
      setError(result.error);
    } else {
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

  const panelSlots = slotsByDate[panel.dateStr] ?? [];
  const panelRecurring = panel.dateStr
    ? weeklySlots.filter((s) => {
        const d = new Date(panel.dateStr + "T12:00:00");
        return s.day_of_week === d.getDay();
      })
    : [];

  return (
    <>
      {/* Column control */}
      <div className="flex items-center justify-end px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setColumns((c) => Math.max(1, c - 1))}
            disabled={columns === 1}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-xl font-bold flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => setColumns((c) => Math.min(7, c + 1))}
            disabled={columns === 7}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-xl font-bold flex items-center justify-center"
          >
            −
          </button>
        </div>
      </div>

      {/* Day headers — only when columns = 7 */}
      {columns === 7 && (
        <div
          className="grid border-b border-gray-100"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {WEEK_DAYS.map((d) => (
            <div key={d} className="text-center text-sm font-bold text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Calendar rows */}
      <div className="divide-y divide-gray-100">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="grid divide-x divide-gray-100"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {row.map((day) => {
              const dateStr = toLocalDateStr(day);
              const daySlots = slotsByDate[dateStr] ?? [];
              const recurring = weeklySlots.filter((s) => s.day_of_week === day.getDay());
              const past = isPast(day);
              const today = isToday(day);
              const hasAny = daySlots.length > 0 || recurring.length > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => openPanel(day)}
                  className={`flex flex-col p-2 min-h-[100px] text-left transition-colors ${
                    past
                      ? "opacity-40 bg-gray-50 hover:bg-gray-100"
                      : hasAny
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {/* Date number */}
                  <div className="mb-1">
                    <span
                      className={`text-base font-bold rounded-full w-8 h-8 flex items-center justify-center ${
                        today ? "bg-blue-600 text-white" : "text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {columns < 7 && (
                      <span className="text-xs text-gray-400 font-medium">{getDayName(day)}</span>
                    )}
                    {day.getDate() === 1 && (
                      <span className="text-xs text-gray-400 block">{MONTHS_SHORT[day.getMonth()]}</span>
                    )}
                  </div>

                  {/* Slots preview */}
                  <div className="flex-1 space-y-1">
                    {recurring.slice(0, 2).map((slot) => (
                      <div key={slot.id} className="bg-indigo-100 rounded px-1 py-0.5">
                        <span className="text-xs font-medium text-indigo-600 leading-tight block">
                          ↻ {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                    {daySlots.slice(0, 2).map((slot) => (
                      <div key={slot.id} className="bg-blue-100 rounded px-1 py-0.5">
                        <span className="text-xs font-medium text-blue-700 leading-tight block">
                          {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                    {(recurring.length + daySlots.length) > 4 && (
                      <span className="text-xs text-blue-400">+{recurring.length + daySlots.length - 4} more</span>
                    )}
                  </div>

                  {/* Plus hint — always visible on non-past days */}
                  {!past && (
                    <span className="mt-1 text-blue-300 text-3xl font-bold leading-none self-center">+</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Day detail panel */}
      {panel.open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={closePanel}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">
                  {panel.past ? "Past day" : "Availability"}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-0.5">
                  {formatFullDate(panel.dateStr)}
                </h2>
              </div>
              <button
                onClick={closePanel}
                className="text-2xl text-gray-400 hover:text-gray-700 font-bold leading-none mt-1"
              >
                ✕
              </button>
            </div>

            {/* Slots list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {panelRecurring.length === 0 && panelSlots.length === 0 ? (
                <p className="text-base text-gray-400 text-center py-4">
                  {panel.past ? "No hours were set for this day." : "No hours set yet. Add some below."}
                </p>
              ) : (
                <>
                  {panelRecurring.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-xs font-medium text-indigo-400 mb-0.5">↻ Weekly recurring</p>
                        <p className="text-lg font-semibold text-indigo-700">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {panelSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-lg font-semibold text-blue-800">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </p>
                      </div>
                      {!panel.past && (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="text-red-400 hover:text-red-600 text-2xl font-bold leading-none ml-4"
                          title="Remove"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Add hours form — only for non-past days */}
            {!panel.past && (
              <div className="border-t border-gray-100 px-6 py-5">
                <p className="text-base font-semibold text-gray-700 mb-3">Add hours</p>
                <form onSubmit={handleAdd} className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-500 mb-1">Start</label>
                      <div className="flex gap-1">
                        <select
                          value={startHour}
                          onChange={(e) => setStartHour(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")).map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <select
                          value={startMin}
                          onChange={(e) => setStartMin(e.target.value)}
                          className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {["00", "15", "30", "45"].map((m) => <option key={m} value={m}>:{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-500 mb-1">End</label>
                      <div className="flex gap-1">
                        <select
                          value={endHour}
                          onChange={(e) => setEndHour(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")).map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <select
                          value={endMin}
                          onChange={(e) => setEndMin(e.target.value)}
                          className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {["00", "15", "30", "45"].map((m) => <option key={m} value={m}>:{m}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  {error && <p className="text-base text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white rounded-xl py-3 text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Adding…" : "Add hours"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
