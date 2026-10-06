"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { Media, SiteSettings } from "@/lib/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton, AdminHeader, Banner, Field, INPUT } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaPicker";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [socialImage, setSocialImage] = useState<Media | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Password change is a separate, self-contained flow.
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pwNotice, setPwNotice] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data) => {
        setSettings(data);
        setForm({
          site_title: data.site_title ?? "",
          site_description: data.site_description ?? "",
          site_url: data.site_url ?? "",
          default_keywords: data.default_keywords ?? "",
          resume_url: data.resume_url ?? "",
          resume_type: data.resume_type ?? "drive",
          resume_label: data.resume_label ?? "",
          public_email: data.public_email ?? "",
          contact_heading: data.contact_heading ?? "",
          contact_intro: data.contact_intro ?? "",
          theme_default: data.theme_default ?? "system",
        });
        setSocialImage(data.default_social_image);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Settings could not be loaded."),
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
      await adminApi.updateSettings({
        ...form,
        default_social_image_id: socialImage?.id ?? null,
      });
      setNotice("Settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Settings could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setPwError(null);
    setPwNotice(null);
    if (next.length < 10) {
      setPwError("Use at least 10 characters.");
      return;
    }
    try {
      await adminApi.changePassword(current, next);
      setPwNotice("Password changed.");
      setCurrent("");
      setNext("");
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "The password could not be changed.");
    }
  }

  return (
    <AdminShell>
      <AdminHeader title="Site settings" description="Resume link, contact details, and how the site appears in search." />

      {error ? <Banner tone="error">{error}</Banner> : null}
      {notice ? <Banner tone="success">{notice}</Banner> : null}

      {!settings ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <div className="max-w-3xl space-y-8">
          <form onSubmit={save} className="space-y-8">
            <section className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
              <h2 className="text-[length:var(--text-md)] font-semibold">Resume</h2>
              <Field
                label="Resume URL"
                htmlFor="resume_url"
                help="A Google Drive share link or a direct PDF URL. Drive links are converted to a direct download automatically."
              >
                <input id="resume_url" type="url" value={form.resume_url} onChange={(e) => set("resume_url", e.target.value)} className={INPUT} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Link type" htmlFor="resume_type">
                  <select id="resume_type" value={form.resume_type} onChange={(e) => set("resume_type", e.target.value)} className={INPUT}>
                    <option value="drive">Google Drive</option>
                    <option value="pdf">Direct PDF</option>
                    <option value="upload">Uploaded file</option>
                  </select>
                </Field>
                <Field label="Button text" htmlFor="resume_label">
                  <input id="resume_label" value={form.resume_label} onChange={(e) => set("resume_label", e.target.value)} className={INPUT} />
                </Field>
              </div>
            </section>

            <section className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
              <h2 className="text-[length:var(--text-md)] font-semibold">Contact</h2>
              <Field label="Public email" htmlFor="public_email">
                <input id="public_email" type="email" value={form.public_email} onChange={(e) => set("public_email", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Contact heading" htmlFor="contact_heading">
                <input id="contact_heading" value={form.contact_heading} onChange={(e) => set("contact_heading", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Contact introduction" htmlFor="contact_intro">
                <textarea id="contact_intro" rows={3} value={form.contact_intro} onChange={(e) => set("contact_intro", e.target.value)} className={`${INPUT} resize-y`} />
              </Field>
              <p className="text-sm text-[var(--muted)]">
                Social links are managed under Categories &amp; tags.
              </p>
            </section>

            <section className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
              <h2 className="text-[length:var(--text-md)] font-semibold">Search &amp; sharing</h2>
              <Field label="Site title" htmlFor="site_title" required>
                <input id="site_title" value={form.site_title} onChange={(e) => set("site_title", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Site description" htmlFor="site_description" help="Shown in search results and link previews.">
                <textarea id="site_description" rows={3} value={form.site_description} onChange={(e) => set("site_description", e.target.value)} className={`${INPUT} resize-y`} />
              </Field>
              <Field label="Site URL" htmlFor="site_url" help="Your live domain. Used for canonical links and the sitemap.">
                <input id="site_url" type="url" value={form.site_url} onChange={(e) => set("site_url", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Default keywords" htmlFor="default_keywords" help="Comma separated.">
                <input id="default_keywords" value={form.default_keywords} onChange={(e) => set("default_keywords", e.target.value)} className={INPUT} />
              </Field>
              <MediaField label="Default share image" value={socialImage} onChange={setSocialImage} category="general" />
              <Field label="Default theme" htmlFor="theme_default">
                <select id="theme_default" value={form.theme_default} onChange={(e) => set("theme_default", e.target.value)} className={INPUT}>
                  <option value="system">Match the visitor's system</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </Field>
            </section>

            <AdminButton type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </AdminButton>
          </form>

          <form onSubmit={changePassword} className="space-y-5 rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-[length:var(--text-md)] font-semibold">Change password</h2>
            {pwError ? <Banner tone="error">{pwError}</Banner> : null}
            {pwNotice ? <Banner tone="success">{pwNotice}</Banner> : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current password" htmlFor="current" required>
                <input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={INPUT} />
              </Field>
              <Field label="New password" htmlFor="next" required help="At least 10 characters.">
                <input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" className={INPUT} />
              </Field>
            </div>
            <AdminButton type="submit" tone="secondary">Change password</AdminButton>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
