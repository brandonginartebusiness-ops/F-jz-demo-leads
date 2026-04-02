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

type CompanySetupFormProps = { initialData: CompanyContextRecord | null };
type FormState = CompanyContextPayload;

const tonePreviewCopy: Record<(typeof TONE_OPTIONS)[number], string> = {
  Professional: "We help owners and facility teams move quickly on demolition scopes with clean estimating, safe execution, and dependable communication.",
  Direct: "If a site needs tear-out, interior demo, or structural removal, we can price it quickly and keep your schedule moving.",
  Conversational: "If you have a demolition package coming up, we would love to take a look and see where we can help the project team move faster.",
  Aggressive: "When deadlines are tight and demo risk is high, JZ Demolition steps in fast, prices decisively, and clears the path for the next trade.",
};

function toInitialState(record: CompanyContextRecord | null): FormState {
  if (!record) {
    return { company_name: "", offering: "", service_areas: "", target_market: "", value_prop: "", differentiators: "", avg_project_size: "Under $500K", tone: "Professional" };
  }
  return {
    company_name: record.company_name, offering: record.offering, service_areas: record.service_areas,
    target_market: record.target_market ?? "", value_prop: record.value_prop, differentiators: record.differentiators,
    avg_project_size: record.avg_project_size, tone: record.tone,
  };
}

export function CompanySetupForm({ initialData }: CompanySetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => toInitialState(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const serviceAreas = useMemo(() => serviceAreasToArray(form.service_areas), [form.service_areas]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Failed to save company setup");

      setSuccess("Company setup saved. Redirecting...");
      router.refresh();
      window.setTimeout(() => router.push("/dashboard"), 800);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save company setup");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Progress bar */}
      <div>
        <div
          aria-label="Setup progress"
          aria-valuemax={3}
          aria-valuemin={1}
          aria-valuenow={step}
          className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-soft"
          role="progressbar"
        >
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <p className="label-stencil-lg">Step {step} of 3</p>
      </div>

      {step === 1 ? (
        <div className="space-y-5 animate-enter">
          <div>
            <label className="label-stencil mb-2 block" htmlFor="company-name">Company name</label>
            <input className="input" id="company-name" onChange={(e) => updateField("company_name", e.target.value)} value={form.company_name} />
          </div>
          <TagInput label="Service areas" onChange={(values) => updateField("service_areas", values.join(", "))} placeholder="Press Enter to add a market" values={serviceAreas} />
          <div>
            <label className="label-stencil mb-2 block" htmlFor="offering">Offering</label>
            <textarea className="input min-h-36" id="offering" onChange={(e) => updateField("offering", e.target.value)} placeholder="Commercial demolition, selective interior demo, structural tear-outs..." value={form.offering} />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5 animate-enter">
          <div>
            <label className="label-stencil mb-2 block" htmlFor="value-prop">Value proposition</label>
            <textarea className="input min-h-36" id="value-prop" onChange={(e) => updateField("value_prop", e.target.value)} placeholder="We help owners and GCs move quickly..." value={form.value_prop} />
          </div>
          <div>
            <label className="label-stencil mb-2 block" htmlFor="differentiators">Differentiators</label>
            <textarea className="input min-h-36" id="differentiators" onChange={(e) => updateField("differentiators", e.target.value)} placeholder="Union-ready crews, quick mobilization..." value={form.differentiators} />
          </div>
          <div>
            <label className="label-stencil mb-2 block" htmlFor="target-market">Target market</label>
            <textarea className="input min-h-28" id="target-market" onChange={(e) => updateField("target_market", e.target.value)} placeholder="Commercial property owners, healthcare facilities..." value={form.target_market} />
          </div>
          <div>
            <label className="label-stencil mb-2 block" htmlFor="avg-project-size">Average project size</label>
            <select className="input" id="avg-project-size" onChange={(e) => updateField("avg_project_size", e.target.value as FormState["avg_project_size"])} value={form.avg_project_size}>
              {PROJECT_SIZE_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
            </select>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5 animate-enter">
          <div>
            <p className="label-stencil mb-3">Tone</p>
            <div className="grid gap-3 md:grid-cols-2">
              {TONE_OPTIONS.map((option) => {
                const selected = form.tone === option;
                return (
                  <button
                    key={option}
                    className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                      selected
                        ? "border-accent bg-accent/10 shadow-lg shadow-accent/10"
                        : "border-stroke bg-bg-raised hover:border-sand/30"
                    }`}
                    onClick={() => updateField("tone", option)}
                    type="button"
                  >
                    <p className="font-semibold text-sand-bright">{option}</p>
                    <p className="mt-1.5 text-sm text-sand">{tonePreviewCopy[option]}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-bg-soft p-5">
            <p className="label-stencil">Tone Preview</p>
            <p className="mt-3 text-sm leading-7 text-sand-light">{tonePreviewCopy[form.tone]}</p>
          </div>
        </div>
      ) : null}

      {(error || success) && (
        <div
          aria-live="polite"
          className={`rounded border px-4 py-3 text-sm ${
            error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-teal/30 bg-teal/10 text-teal"
          }`}
          role={error ? "alert" : "status"}
        >
          {error ?? success}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-stroke pt-5">
        {step > 1 ? (
          <button className="btn-ghost" onClick={() => setStep((c) => c - 1)} type="button">Back</button>
        ) : null}
        {step < 3 ? (
          <button className="btn-accent" onClick={() => setStep((c) => c + 1)} type="button">Continue</button>
        ) : (
          <button className="btn-accent" disabled={isSaving} onClick={handleSubmit} type="button">
            {isSaving ? "SAVING..." : "SAVE SETUP"}
          </button>
        )}
      </div>
    </div>
  );
}
