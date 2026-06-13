"use client";

import { useState } from "react";
import { addWeeklyAvailability, deleteWeeklyAvailability } from "../../actions";
import type { CleanerWeeklyAvailability } from "@/types/database";

// Mon-first display order; value = day_of_week stored in DB (0=Sun, 1=Mon … 6=Sat)
const DAYS = [
  { label: "Monday",    short: "Mon", value: 1 },
  { label: "Tuesday",   short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday",  short: "Thu", value: 4 },
  { label: "Friday",    short: "Fri", value: 5 },
  { label: "Saturday",  short: "Sat", value: 6 },
  { label: "Sunday",    short: "Sun", value: 0 },
];

const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const MINS = ["00", "15", "30", "45"];

interface Props {
  slots: CleanerWeeklyAvailability[];
}

export default function AvailabilityGrid({ slots: initialSlots }: Props) {
  const [slots, setSlots] = useState(initialSlots);
  const [modal, setModal] = useState<{ open: boolean; day: number }>({ open: false, day: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMin, setEndMin] = useState("00");

  const slotsByDay = DAYS.reduce<Record<number, CleanerWeeklyAvailability[]>>((acc, { value }) => {
    acc[value] = slots.filter((s) => s.day_of_week === value);
    return acc;
  }, {});

  function openModal(day: number) {
    setError(null);
    setStartHour("08"); setStartMin("00");
    setEndHour("17"); setEndMin("00");
    setModal({ open: true, day });
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("day_of_week", String(modal.day));
    formData.set("start_time", `${startHour}:${startMin}`);
    formData.set("end_time", `${endHour}:${endMin}`);
    const result = await addWeeklyAvailability(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setModal({ open: false, day: 1 });
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteWeeklyAvailability(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== id));
    }
  }

  const modalDayLabel = DAYS.find((d) => d.value === modal.day)?.label ?? "";

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {DAYS.map(({ label, value }) => (
          <div key={value} className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col min-h-[140px]">
            <div className="text-sm font-bold text-gray-700 mb-2">{label}</div>
            <div className="flex-1 space-y-1.5">
              {slotsByDay[value].map((slot) => (
                <div key={slot.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-2 py-1.5">
                  <span className="text-xs font-medium text-blue-700">
                    {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                  </span>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-red-400 hover:text-red-600 ml-1 text-base font-bold leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => openModal(value)}
              className="mt-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-lg py-1.5 transition-colors"
            >
              + Add
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Add recurring hours</h2>
            <p className="text-sm text-gray-500 mb-6">Every {modalDayLabel}</p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">Start</label>
                  <div className="flex gap-1">
                    <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={startMin} onChange={(e) => setStartMin(e.target.value)} className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {MINS.map((m) => <option key={m} value={m}>:{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">End</label>
                  <div className="flex gap-1">
                    <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={endMin} onChange={(e) => setEndMin(e.target.value)} className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {MINS.map((m) => <option key={m} value={m}>:{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setModal({ open: false, day: 1 }); setError(null); }}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
