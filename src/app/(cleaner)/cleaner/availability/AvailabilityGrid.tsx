"use client";

import { useState } from "react";
import { addAvailability, deleteAvailability } from "../../actions";
import type { CleanerAvailability } from "@/types/database";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  slots: CleanerAvailability[];
}

interface AddModalState {
  open: boolean;
  day: number;
}

export default function AvailabilityGrid({ slots: initialSlots }: Props) {
  const [slots, setSlots] = useState(initialSlots);
  const [modal, setModal] = useState<AddModalState>({ open: false, day: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotsByDay = DAYS.reduce<Record<number, CleanerAvailability[]>>(
    (acc, _, i) => {
      acc[i] = slots.filter((s) => s.day_of_week === i);
      return acc;
    },
    {}
  );

  const [startHour, setStartHour] = useState("08");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMin, setEndMin] = useState("00");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("day_of_week", String(modal.day));
    formData.set("start_time", `${startHour}:${startMin}`);
    formData.set("end_time", `${endHour}:${endMin}`);
    const result = await addAvailability(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setModal({ open: false, day: 0 });
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
      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day, i) => (
          <div key={day} className="bg-white rounded-xl border border-gray-200 p-3 min-h-[120px] flex flex-col">
            <div className="text-xs font-semibold text-gray-500 mb-2">{day}</div>
            <div className="flex-1 space-y-1.5">
              {slotsByDay[i].map((slot) => (
                <div
                  key={slot.id}
                  className="group flex items-center justify-between bg-blue-50 rounded-md px-2 py-1"
                >
                  <span className="text-xs text-blue-700">
                    {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                  </span>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-blue-300 hover:text-red-500 ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModal({ open: true, day: i })}
              className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium"
            >
              + Add
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-base text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Add time block modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Add block — {DAYS[modal.day]}
            </h2>
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
              {error && (
                <p className="text-base text-red-600">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setModal({ open: false, day: 0 }); setError(null); }}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-base hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-base font-medium hover:bg-blue-700 disabled:opacity-50"
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
