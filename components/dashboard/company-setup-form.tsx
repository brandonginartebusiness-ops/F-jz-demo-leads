"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  PROJECT_SIZE_OPTIONS,
  TONE_OPTIONS,
  type CompanyContextPayload,
  type CompanyContextRecord,
  serviceAreasToArray,
} from "@/lib/company-context/schema";

import { TagInput } from "./tag-input";

type CompanySetupFormProps = {
  initialData: CompanyContextRecord | null;
};

type FormState = CompanyContextPayload;

const tonePreviewCopy: Record<(typeof TONE_OPTIONS)[number], string> = {
  Professional:
    "We help owners and facility teams move quickly on demolition scopes with clean estimating, safe execution, and dependable communication.",
  Direct:
    "If a site needs tear-out, interior demo, or structural removal, we can price it quickly and keep your schedule moving.",
  Conversational:
    "If you have a demolition package coming up, we would love to take a look and see where we can help the project team move faster.",
  Aggressive:
    "When deadlines are tight and demo risk is high, JZ Demolition steps in fast, prices decisively, and clears the path for the next trade.",
};

function toInitialState(record: CompanyContextRecord | null): FormState {
  if (!record) {
    return {
      company_name: "",
      offering: "",
      service_areas: "",
      target_market: "",
      value_prop: "",
      differentiators: "",
      avg_project_size: "Under $500K",
      tone: "Professional",
    };
  }

  return {
    company_name: record.company_name,
    offering: record.offering,
    service_areas: record.service_areas,
    target_market: record.target_market ?? "",
    value_prop: record.value_prop,
    differentiators: record.differentiators,
    avg_project_size: record.avg_project_size,
    tone: record.tone,
  };
}

export function CompanySetupForm({ initialData }: CompanySetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => toInitialState(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const serviceAreas = useMemo(
    () => serviceAreasToArray(form.service_areas),
    [form.service_areas],
  );

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/leads/gather-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to save company setup");
      }

      setSuccess("Company setup saved. Redirecting to dashboard...");
      router.refresh();
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to save company setup",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#c9a84c] transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <p className="text-sm uppercase tracking-[0.3em] text-[#f2df9e]">
          Step {step} of 3
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-white"
              htmlFor="company-name"
            >
              Company name
            </label>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
              id="company-name"
              onChange={(event) => updateField("company_name", event.target.value)}
              value={form.company_name}
            />
          </div>

          <TagInput
            label="Service areas"
            onChange={(values) => updateField("service_areas", values.join(", "))}
            placeholder="Press Enter to add a market"
            values={serviceAreas}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-white" htmlFor="offering">
              Offering
            </label>
            <textarea
              className="min-h-36 w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
              id="offering"
              onChange={(event) => updateField("offering", event.target.value)}
              placeholder="Commercial demolition, selective interior demo, structural tear-outs, and site clearing."
              value={form.offering}
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-white"
              htmlFor="value-prop"
            >
              Value proposition
            </label>
            <textarea
              className="min-h-36 w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
              id="value-prop"
              onChange={(event) => updateField("value_prop", event.target.value)}
              placeholder="We help owners and GCs move quickly through demolition scopes with fast estimating and safe field execution."
              value={form.value_prop}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-white"
              htmlFor="differentiators"
            >
              Differentiators
            </label>
            <textarea
              className="min-h-36 w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
              id="differentiators"
              onChange={(event) => updateField("differentiators", event.target.value)}
              placeholder="Union-ready crews, quick mobilization, clear scopes, and responsive preconstruction support."
              value={form.differentiators}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-white"
              htmlFor="target-market"
            >
              Target market
            </label>
            <textarea
              className="min-h-28 w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
              id="target-market"
              onChange={(event) => updateField("target_market", event.target.value)}
              placeholder="Commercial property owners, healthcare facilities, retail redevelopments, and tenant improvement teams."
              value={form.target_market}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-white"
              htmlFor="avg-project-size"
            >
              Average project size
            </label>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
              id="avg-project-size"
              onChange={(event) =>
                updateField(
                  "avg_project_size",
                  event.target.value as FormState["avg_project_size"],
                )
              }
              value={form.avg_project_size}
            >
              {PROJECT_SIZE_OPTIONS.map((option) => (
                <option key={option} className="text-black" value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-white">Tone</p>
            <div className="grid gap-3 md:grid-cols-2">
              {TONE_OPTIONS.map((option) => {
                const selected = form.tone === option;

                return (
                  <button
                    key={option}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-[#c9a84c] bg-[#c9a84c]/10"
                        : "border-white/10 bg-[#11111d] hover:border-[#c9a84c]/50"
                    }`}
                    onClick={() => updateField("tone", option)}
                    type="button"
                  >
                    <p className="font-medium text-white">{option}</p>
                    <p className="mt-2 text-sm text-white/60">{tonePreviewCopy[option]}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11111d] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Tone preview</p>
            <p className="mt-3 text-sm leading-7 text-white/80">
              {tonePreviewCopy[form.tone]}
            </p>
          </div>
        </div>
      ) : null}

      {(error || success) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-[#c05a4f]/40 bg-[#c05a4f]/10 text-[#f2c4bf]"
              : "border-[#c9a84c]/30 bg-[#c9a84c]/10 text-[#f2df9e]"
          }`}
        >
          {error ?? success}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {step > 1 ? (
          <button
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white transition hover:border-[#c9a84c]"
            onClick={() => setStep((current) => current - 1)}
            type="button"
          >
            Back
          </button>
        ) : null}

        {step < 3 ? (
          <button
            className="rounded-xl bg-[#c9a84c] px-4 py-3 text-sm font-medium text-[#11111d] transition hover:bg-[#d9b75c]"
            onClick={() => setStep((current) => current + 1)}
            type="button"
          >
            Continue
          </button>
        ) : (
          <button
            className="rounded-xl bg-[#c9a84c] px-4 py-3 text-sm font-medium text-[#11111d] transition hover:bg-[#d9b75c] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={handleSubmit}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Setup"}
          </button>
        )}
      </div>
    </div>
  );
}
