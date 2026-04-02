"use client";

import { useState } from "react";

type TagInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  presets?: readonly string[];
  placeholder?: string;
};

export function TagInput({ label, values, onChange, presets = [], placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addValue(value: string) {
    const nextValue = value.trim();
    if (!nextValue) return;
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
      <label className="label-stencil mb-2 block">{label}</label>
      <div className="card p-3">
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <button
              key={value}
              className="rounded border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-sand-light transition-colors hover:bg-accent/20"
              onClick={() => removeValue(value)}
              type="button"
            >
              {value} ×
            </button>
          ))}
        </div>

        <input
          className="input mt-3"
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
                  className={`rounded border px-3 py-1 text-sm transition-all duration-200 ${
                    isSelected
                      ? "border-accent bg-accent text-white"
                      : "border-stroke text-sand hover:border-sand/30 hover:text-sand-bright"
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
