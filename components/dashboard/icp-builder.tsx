"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_LOCATION,
  DEFAULT_PROPERTY_TYPES,
  INDUSTRY_PRESETS,
  JOB_TITLE_PRESETS,
  type IcpProfileInput,
  type IcpProfileRecord,
} from "@/lib/icp/schema";

import { DeleteIcpModal } from "./delete-icp-modal";
import { TagInput } from "./tag-input";

type PropertyType = "commercial" | "residential";

type IcpBuilderProps = {
  initialProfiles: IcpProfileRecord[];
};

type FormState = {
  name: string;
  industries: string[];
  company_size_min: string;
  company_size_max: string;
  job_titles: string[];
  locations: string[];
  property_types: PropertyType[];
};

const initialFormState: FormState = {
  name: "",
  industries: [],
  company_size_min: "",
  company_size_max: "",
  job_titles: [],
  locations: [DEFAULT_LOCATION],
  property_types: [...DEFAULT_PROPERTY_TYPES],
};

function formatCompanySize(min: number | null, max: number | null) {
  if (min !== null && max !== null) {
    return `${min.toLocaleString()}-${max.toLocaleString()} employees`;
  }

  if (min !== null) {
    return `${min.toLocaleString()}+ employees`;
  }

  if (max !== null) {
    return `Up to ${max.toLocaleString()} employees`;
  }

  return "Not specified";
}

function normalizePayload(form: FormState): IcpProfileInput {
  return {
    name: form.name,
    industries: form.industries,
    company_size_min: form.company_size_min ? Number(form.company_size_min) : null,
    company_size_max: form.company_size_max ? Number(form.company_size_max) : null,
    job_titles: form.job_titles,
    locations: form.locations,
    property_types: form.property_types,
  };
}

function togglePropertyType(
  current: PropertyType[],
  value: PropertyType,
  checked: boolean,
): PropertyType[] {
  if (checked) {
    return Array.from(new Set([...current, value])) as PropertyType[];
  }

  return current.filter((entry) => entry !== value);
}

export function IcpBuilder({ initialProfiles }: IcpBuilderProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isRescoring, setIsRescoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<IcpProfileRecord | null>(null);

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/leads/icp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizePayload(form)),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; data?: IcpProfileRecord }
        | null;

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error ?? "Failed to save ICP profile");
      }

      setProfiles((current) => [payload.data as IcpProfileRecord, ...current]);
      setForm(initialFormState);
      setSuccess("ICP profile saved.");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to save ICP profile",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!profileToDelete) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/leads/icp/${profileToDelete.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to delete ICP profile");
      }

      setProfiles((current) =>
        current.filter((profile) => profile.id !== profileToDelete.id),
      );
      setSuccess("ICP profile deleted.");
      setProfileToDelete(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete ICP profile",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleRescore() {
    setError(null);
    setSuccess(null);
    setIsRescoring(true);

    try {
      const response = await fetch("/api/permits/score", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; updated?: number }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to rescore permits");
      }

      setSuccess(`Rescored ${payload?.updated ?? 0} permits — ICP matches now reflect in priority sort.`);
    } catch (rescoreError) {
      setError(
        rescoreError instanceof Error ? rescoreError.message : "Failed to rescore permits",
      );
    } finally {
      setIsRescoring(false);
    }
  }

  async function handleToggleActive(profile: IcpProfileRecord) {
    setError(null);
    setSuccess(null);
    setTogglingId(profile.id);

    try {
      const response = await fetch(`/api/leads/icp/${profile.id}`, {
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; data?: IcpProfileRecord }
        | null;

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error ?? "Failed to update profile");
      }

      setProfiles((current) =>
        current.map((p) => (p.id === profile.id ? (payload.data as IcpProfileRecord) : p)),
      );
      setSuccess(payload.data.is_active ? "Profile active in pipeline." : "Profile removed from pipeline.");
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : "Failed to update profile",
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <section className="card-accent p-6 animate-enter delay-1">
          <div className="mb-6">
            <p className="label-stencil text-accent">New ICP profile</p>
            <h2 className="mt-2 font-display text-2xl text-sand-bright">
              DEFINE YOUR IDEAL DEMOLITION BUYER
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-sand">
              Save target industries, buyer titles, employee ranges, and locations
              so your pipeline can reuse them later. New profiles default to
              commercial properties only.
            </p>
          </div>

          <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <div className="lg:col-span-2">
              <label
                className="label-stencil mb-2 block"
                htmlFor="profile-name"
              >
                Profile name
              </label>
              <input
                className="input"
                id="profile-name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="South Florida hospital facility teams"
                value={form.name}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="label-stencil mb-2 block">
                Property types
              </label>
              <div className="card flex flex-wrap gap-3 p-4">
                <label className="flex items-center gap-2 text-sm text-sand-bright">
                  <input
                    checked={form.property_types.includes("commercial")}
                    className="h-4 w-4 accent-accent"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        property_types: togglePropertyType(
                          current.property_types,
                          "commercial",
                          event.target.checked,
                        ),
                      }))
                    }
                    type="checkbox"
                  />
                  Commercial
                </label>
                <label className="flex items-center gap-2 text-sm text-sand-bright">
                  <input
                    checked={form.property_types.includes("residential")}
                    className="h-4 w-4 accent-accent"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        property_types: togglePropertyType(
                          current.property_types,
                          "residential",
                          event.target.checked,
                        ),
                      }))
                    }
                    type="checkbox"
                  />
                  Residential
                </label>
              </div>
              <p className="mt-2 text-xs text-sand">
                Commercial is selected by default so new targeting profiles stay aligned
                with the dashboard.
              </p>
            </div>

            <div className="lg:col-span-2">
              <TagInput
                label="Industries"
                onChange={(industries) =>
                  setForm((current) => ({ ...current, industries }))
                }
                placeholder="Press Enter to add an industry"
                presets={INDUSTRY_PRESETS}
                values={form.industries}
              />
            </div>

            <div>
              <label
                className="label-stencil mb-2 block"
                htmlFor="company-size-min"
              >
                Min employees
              </label>
              <input
                className="input"
                id="company-size-min"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    company_size_min: event.target.value,
                  }))
                }
                placeholder="50"
                type="number"
                value={form.company_size_min}
              />
            </div>

            <div>
              <label
                className="label-stencil mb-2 block"
                htmlFor="company-size-max"
              >
                Max employees
              </label>
              <input
                className="input"
                id="company-size-max"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    company_size_max: event.target.value,
                  }))
                }
                placeholder="5000"
                type="number"
                value={form.company_size_max}
              />
            </div>

            <div className="lg:col-span-2">
              <TagInput
                label="Job titles to target"
                onChange={(job_titles) =>
                  setForm((current) => ({ ...current, job_titles }))
                }
                placeholder="Press Enter to add a title"
                presets={JOB_TITLE_PRESETS}
                values={form.job_titles}
              />
            </div>

            <div className="lg:col-span-2">
              <TagInput
                label="Locations"
                onChange={(locations) =>
                  setForm((current) => ({ ...current, locations }))
                }
                placeholder="Press Enter to add a city or metro"
                values={form.locations}
              />
            </div>

            {(error || success) && (
              <div className="lg:col-span-2">
                <div
                  className={`card px-4 py-3 text-sm ${
                    error
                      ? "border-red-500/40 bg-red-500/10 text-red-200"
                      : "border-stroke-accent bg-accent/10 text-sand-light"
                  }`}
                >
                  {error ?? success}
                </div>
              </div>
            )}

            <div className="lg:col-span-2">
              <button
                className="btn-accent"
                disabled={!canSubmit || isSaving}
                type="submit"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>

        <section className="card-accent p-6 animate-enter delay-2">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-stencil text-accent">Saved ICP profiles</p>
              <h2 className="mt-2 font-display text-2xl text-sand-bright">
                REUSABLE TARGETING PROFILES
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="btn-ghost-sm"
                disabled={isRescoring}
                onClick={handleRescore}
                title="Re-apply active ICP profiles to all permit priority scores"
                type="button"
              >
                {isRescoring ? "Rescoring..." : "Rescore permits"}
              </button>
              <div className="card-accent px-5 py-3">
                <p className="label-stencil">Profiles</p>
                <p className="mt-1 stat-value-sm">{profiles.length}</p>
              </div>
            </div>
          </div>

          {profiles.length === 0 ? (
            <div className="card border-dashed p-10 text-center text-sand">
              No ICP profiles yet. Create your first profile to define who the team
              should target next.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {profiles.map((profile) => (
                <article
                  key={profile.id}
                  className="card p-5 transition-all duration-200 hover:border-stroke-accent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-sand-bright">{profile.name}</h3>
                      <p className="mt-1 text-sm text-sand">
                        {profile.locations?.join(", ") || DEFAULT_LOCATION}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        profile.is_active
                          ? "bg-accent/20 text-accent"
                          : "bg-bg-soft text-sand"
                      }`}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <dl className="mt-5 space-y-4 text-sm">
                    <div>
                      <dt className="label-stencil">Property types</dt>
                      <dd className="mt-2 text-sand-light">
                        {profile.property_types?.length
                          ? profile.property_types
                              .map((value) =>
                                value === "commercial" ? "Commercial" : "Residential",
                              )
                              .join(", ")
                          : "Commercial"}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-stencil">Industries</dt>
                      <dd className="mt-2 text-sand-light">
                        {profile.industries?.length
                          ? profile.industries.join(", ")
                          : "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-stencil">Job titles</dt>
                      <dd className="mt-2 text-sand-light">
                        {profile.job_titles?.length
                          ? profile.job_titles.join(", ")
                          : "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-stencil">Company size</dt>
                      <dd className="mt-2 text-sand-light">
                        {formatCompanySize(
                          profile.company_size_min,
                          profile.company_size_max,
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className={`btn text-sm px-4 py-2 border ${
                        profile.is_active
                          ? "border-accent/50 text-accent hover:border-red-400 hover:text-red-300"
                          : "border-stroke text-sand hover:border-accent/50 hover:text-accent"
                      } disabled:opacity-40`}
                      disabled={togglingId === profile.id}
                      onClick={() => handleToggleActive(profile)}
                      type="button"
                    >
                      {togglingId === profile.id
                        ? "Saving..."
                        : profile.is_active
                          ? "Active in Pipeline"
                          : "Use in Pipeline"}
                    </button>
                    <button
                      className="btn-ghost-sm hover:border-red-400/50 hover:text-red-300"
                      onClick={() => setProfileToDelete(profile)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <DeleteIcpModal
        isDeleting={isDeleting}
        isOpen={Boolean(profileToDelete)}
        onCancel={() => {
          if (!isDeleting) {
            setProfileToDelete(null);
          }
        }}
        onConfirm={handleDelete}
        profileName={profileToDelete?.name ?? ""}
      />
    </>
  );
}
