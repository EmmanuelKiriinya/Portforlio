"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { Media, Profile } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton, AdminHeader, Banner, Field, INPUT } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaPicker";
import { CloseIcon } from "@/components/ui/icons";

interface Stat { label: string; value: string }
interface Area { title: string; description: string }

export default function ProfileAdmin() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [image, setImage] = useState<Media | null>(null);
  const [aboutImage, setAboutImage] = useState<Media | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name ?? "",
          headline: data.headline ?? "",
          hero_description: data.hero_description ?? "",
          about_heading: data.about_heading ?? "",
          bio: data.bio ?? "",
          location: data.location ?? "",
          primary_cta_label: data.primary_cta_label ?? "",
          primary_cta_url: data.primary_cta_url ?? "",
          secondary_cta_label: data.secondary_cta_label ?? "",
          secondary_cta_url: data.secondary_cta_url ?? "",
        });
        setImage(data.profile_image);
        setAboutImage(data.about_image);
        setStats(data.stats.map((s) => ({ label: s.label, value: s.value })));
        setAreas(data.expertise.map((a) => ({ title: a.title, description: a.description ?? "" })));
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Your profile could not be loaded."),
      );
  }, []);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.updateProfile({
        ...form,
        profile_image_id: image?.id ?? null,
        about_image_id: aboutImage?.id ?? null,
        stats: stats
          .filter((s) => s.label.trim() && s.value.trim())
          .map((s, i) => ({ ...s, display_order: i })),
        expertise: areas
          .filter((a) => a.title.trim())
          .map((a, i) => ({ ...a, display_order: i })),
      });
      setNotice("Profile saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Your profile could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        title="Profile & about"
        description="Everything in the hero and the About page comes from here."
      />

      {error ? <Banner tone="error">{error}</Banner> : null}
      {notice ? <Banner tone="success">{notice}</Banner> : null}

      {!profile ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <form onSubmit={save} className="max-w-3xl space-y-8">
          <section className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-[length:var(--text-md)] font-semibold">Hero</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="name" required>
                <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Location" htmlFor="location">
                <input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} className={INPUT} />
              </Field>
            </div>

            <Field label="Headline" htmlFor="headline" required help="e.g. Data Scientist · Machine Learning · AI">
              <input id="headline" value={form.headline} onChange={(e) => set("headline", e.target.value)} className={INPUT} />
            </Field>

            <Field label="Hero introduction" htmlFor="hero_description" help="Two or three lines on what you build and for whom.">
              <textarea
                id="hero_description"
                rows={3}
                value={form.hero_description}
                onChange={(e) => set("hero_description", e.target.value)}
                className={`${INPUT} resize-y`}
              />
            </Field>

            <MediaField label="Profile photo" value={image} onChange={setImage} category="profile" />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Primary button text" htmlFor="primary_cta_label">
                <input id="primary_cta_label" value={form.primary_cta_label} onChange={(e) => set("primary_cta_label", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Primary button link" htmlFor="primary_cta_url">
                <input id="primary_cta_url" value={form.primary_cta_url} onChange={(e) => set("primary_cta_url", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Secondary button text" htmlFor="secondary_cta_label">
                <input id="secondary_cta_label" value={form.secondary_cta_label} onChange={(e) => set("secondary_cta_label", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Secondary button link" htmlFor="secondary_cta_url">
                <input id="secondary_cta_url" value={form.secondary_cta_url} onChange={(e) => set("secondary_cta_url", e.target.value)} className={INPUT} />
              </Field>
            </div>
          </section>

          <section className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-[length:var(--text-md)] font-semibold">About</h2>

            <Field label="About heading" htmlFor="about_heading">
              <input id="about_heading" value={form.about_heading} onChange={(e) => set("about_heading", e.target.value)} className={INPUT} />
            </Field>

            <Field label="Bio" htmlFor="bio" help="Leave a blank line between paragraphs.">
              <textarea
                id="bio"
                rows={10}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                className={`${INPUT} resize-y`}
              />
            </Field>

            <MediaField label="About page image" value={aboutImage} onChange={setAboutImage} category="profile" />
          </section>

          <section className="space-y-4 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-[length:var(--text-md)] font-semibold">Statistics</h2>
            <p className="text-sm text-[var(--muted)]">
              Shown under the About section. Leave empty to hide them.
            </p>
            <ul className="space-y-2">
              {stats.map((stat, index) => (
                <li key={index} className="flex gap-2">
                  <input
                    value={stat.label}
                    onChange={(e) => {
                      const next = [...stats];
                      next[index] = { ...next[index], label: e.target.value };
                      setStats(next);
                    }}
                    placeholder="Label, e.g. Years in data"
                    aria-label={`Statistic ${index + 1} label`}
                    className={INPUT}
                  />
                  <input
                    value={stat.value}
                    onChange={(e) => {
                      const next = [...stats];
                      next[index] = { ...next[index], value: e.target.value };
                      setStats(next);
                    }}
                    placeholder="Value"
                    aria-label={`Statistic ${index + 1} value`}
                    className={`${INPUT} max-w-[8rem]`}
                  />
                  <button
                    type="button"
                    onClick={() => setStats(stats.filter((_, i) => i !== index))}
                    aria-label={`Remove statistic ${index + 1}`}
                    className="px-2 text-[var(--muted)] hover:text-[var(--ember)]"
                  >
                    <CloseIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setStats([...stats, { label: "", value: "" }])}
              className="text-sm text-[var(--gold)] underline underline-offset-4"
            >
              Add a statistic
            </button>
          </section>

          <section className="space-y-4 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-[length:var(--text-md)] font-semibold">Areas of expertise</h2>
            <ul className="space-y-4">
              {areas.map((area, index) => (
                <li key={index} className="space-y-2 border-l-2 border-[var(--line)] pl-4">
                  <div className="flex gap-2">
                    <input
                      value={area.title}
                      onChange={(e) => {
                        const next = [...areas];
                        next[index] = { ...next[index], title: e.target.value };
                        setAreas(next);
                      }}
                      placeholder="Title"
                      aria-label={`Expertise area ${index + 1} title`}
                      className={INPUT}
                    />
                    <button
                      type="button"
                      onClick={() => setAreas(areas.filter((_, i) => i !== index))}
                      aria-label={`Remove expertise area ${index + 1}`}
                      className="px-2 text-[var(--muted)] hover:text-[var(--ember)]"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={area.description}
                    onChange={(e) => {
                      const next = [...areas];
                      next[index] = { ...next[index], description: e.target.value };
                      setAreas(next);
                    }}
                    placeholder="Description"
                    aria-label={`Expertise area ${index + 1} description`}
                    className={`${INPUT} resize-y`}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setAreas([...areas, { title: "", description: "" }])}
              className="text-sm text-[var(--gold)] underline underline-offset-4"
            >
              Add an area
            </button>
          </section>

          <AdminButton type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </AdminButton>
        </form>
      )}
    </AdminShell>
  );
}
