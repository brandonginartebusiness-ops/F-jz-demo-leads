"use client";

import { useState } from "react";

type TagInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  presets?: readonly string[];
  placeholder?: string;
};

export function TagInput({
  label,
  values,
  onChange,
  presets = [],
  placeholder,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addValue(value: string) {
    const nextValue = value.trim();

    if (!nextValue) {
      return;
    }

    if (values.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      setDraft("");
      return;
    }

    onChange([...values, nextValue]);
    setDraft("");
  }

  function removeValue(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white">{label}</label>
      <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-3">
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <button
              key={value}
              className="rounded-full border border-[#FF6B00]/25 bg-[#FF6B00]/10 px-3 py-1 text-sm text-[#C0C0C0] transition hover:border-[#FF6B00]"
              onClick={() => removeValue(value)}
              type="button"
            >
              {value} x
            </button>
          ))}
        </div>

        <input
          className="mt-3 w-full rounded-xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue(draft);
            }
          }}
          placeholder={placeholder}
          value={draft}
        />

        {presets.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset) => {
              const isSelected = values.includes(preset);

              return (
                <button
                  key={preset}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    isSelected
                      ? "border-[#FF6B00] bg-[#FF6B00] text-[#0a0a0a]"
                      : "border-[#FF6B00]/25 bg-[#1a1a1a] text-[#C0C0C0] hover:border-[#FF6B00]"
                  }`}
                  onClick={() => addValue(preset)}
                  type="button"
                >
                  {preset}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
