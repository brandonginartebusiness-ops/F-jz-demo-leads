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
        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[#C0C0C0]">
              New ICP profile
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Define your ideal demolition buyer
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#888888]">
              Save target industries, buyer titles, employee ranges, and locations
              so your pipeline can reuse them later. New profiles default to
              commercial properties only.
            </p>
          </div>

          <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <div className="lg:col-span-2">
              <label
                className="mb-2 block text-sm font-medium text-white"
                htmlFor="profile-name"
              >
                Profile name
              </label>
              <input
                className="w-full rounded-xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]"
                id="profile-name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="South Florida hospital facility teams"
                value={form.name}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white">
                Property types
              </label>
              <div className="flex flex-wrap gap-3 rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    checked={form.property_types.includes("commercial")}
                    className="h-4 w-4 accent-[#FF6B00]"
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
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    checked={form.property_types.includes("residential")}
                    className="h-4 w-4 accent-[#FF6B00]"
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
              <p className="mt-2 text-xs text-[#888888]">
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
                className="mb-2 block text-sm font-medium text-white"
                htmlFor="company-size-min"
              >
                Min employees
              </label>
              <input
                className="w-full rounded-xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]"
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
                className="mb-2 block text-sm font-medium text-white"
                htmlFor="company-size-max"
              >
                Max employees
              </label>
              <input
                className="w-full rounded-xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]"
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
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    error
                      ? "border-[#c05a4f]/40 bg-[#c05a4f]/10 text-[#f2c4bf]"
                      : "border-[#FF6B00]/25 bg-[#FF6B00]/10 text-[#C0C0C0]"
                  }`}
                >
                  {error ?? success}
                </div>
              </div>
            )}

            <div className="lg:col-span-2">
              <button
                className="rounded-xl bg-[#FF6B00] px-5 py-3 font-medium text-[#0a0a0a] transition hover:bg-[#FF8C00] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canSubmit || isSaving}
                type="submit"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#C0C0C0]">
                Saved ICP profiles
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Reusable targeting profiles
              </h2>
            </div>
            <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">Profiles</p>
              <p className="mt-1 text-xl font-semibold text-white">{profiles.length}</p>
            </div>
          </div>

          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#FF6B00]/25 bg-[#1a1a1a] p-10 text-center text-[#888888]">
              No ICP profiles yet. Create your first profile to define who the team
              should target next.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {profiles.map((profile) => (
                <article
                  key={profile.id}
                  className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                      <p className="mt-1 text-sm text-[#888888]">
                        {profile.locations?.join(", ") || DEFAULT_LOCATION}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        profile.is_active
                          ? "bg-[#FF6B00]/20 text-[#FF6B00]"
                          : "bg-[#333]/40 text-[#666]"
                      }`}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <dl className="mt-5 space-y-4 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">
                        Property types
                      </dt>
                      <dd className="mt-2 text-white/80">
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
                      <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">
                        Industries
                      </dt>
                      <dd className="mt-2 text-white/80">
                        {profile.industries?.length
                          ? profile.industries.join(", ")
                          : "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">
                        Job titles
                      </dt>
                      <dd className="mt-2 text-white/80">
                        {profile.job_titles?.length
                          ? profile.job_titles.join(", ")
                          : "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">
                        Company size
                      </dt>
                      <dd className="mt-2 text-white/80">
                        {formatCompanySize(
                          profile.company_size_min,
                          profile.company_size_max,
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className={`rounded-xl border px-4 py-3 text-sm transition ${
                        profile.is_active
                          ? "border-[#FF6B00]/50 text-[#FF6B00] hover:border-[#c05a4f] hover:text-[#f2c4bf]"
                          : "border-[#FF6B00]/25 text-[#C0C0C0] hover:border-[#FF6B00]/50 hover:text-[#FF6B00]"
                      } disabled:opacity-40`}
                      disabled={togglingId === profile.id}
                      onClick={() => handleToggleActive(profile)}
                      type="button"
                    >
                      {togglingId === profile.id
                        ? "Saving…"
                        : profile.is_active
                          ? "Active in Pipeline"
                          : "Use in Pipeline"}
                    </button>
                    <button
                      className="rounded-xl border border-[#FF6B00]/25 px-4 py-3 text-sm text-[#C0C0C0] transition hover:border-[#c05a4f] hover:text-[#f2c4bf]"
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
