import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { PostCard } from "@/components/blog/PostCard";
import { EmptyState, ButtonLink } from "@/components/ui";
import { SearchField } from "@/components/ui/SearchField";
import { FilterChips } from "@/components/ui/FilterChips";
import { Pagination } from "@/components/ui/Pagination";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl, formatFullDate } from "@/lib/utils";
import { Weave } from "@/components/weave/Weave";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description: "Technical writing on machine learning, evaluation, and data practice.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; tag?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const isFiltered = Boolean(params.q || params.category || params.tag);

  const [data, categories, featuredData] = await Promise.all([
    api.posts({ page, per_page: 9, category: params.category, tag: params.tag, q: params.q }),
    api.blogCategories(),
    // The featured article only leads the unfiltered first page.
    !isFiltered && page === 1 ? api.posts({ featured: true, per_page: 1 }) : Promise.resolve(null),
  ]);

  const featured = featuredData?.items?.[0] ?? null;
  const posts = featured
    ? (data?.items ?? []).filter((p) => p.id !== featured.id)
    : data?.items ?? [];

  return (
    <div>
      {/* Weight 2 of the weave: the blog header band. */}
      <header className="relative overflow-hidden border-b border-[var(--line)]">
        {/* Confined to the right half and faded in from the left, so no text
            ever sits over the pattern. Hidden on small screens, where the
            heading would run into it. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden w-5/12 overflow-hidden md:block"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 62%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 62%)",
          }}
        >
          <Weave seed={64} bandCount={7} height={340} className="h-full w-full" />
        </div>
        <div className="shell relative py-16 md:py-20">
          <h1 className="text-[length:var(--text-2xl)] md:text-[length:var(--text-3xl)]">Writing</h1>
          <p className="mt-4 max-w-2xl text-[length:var(--text-md)] leading-relaxed text-[var(--muted)]">
            Notes from applied work — what held up in production, what did not, and the
            reasoning in between.
          </p>
        </div>
      </header>

      <div className="shell section">
        <div className="mb-10 flex flex-col gap-5 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <Suspense fallback={null}>
            <FilterChips
              param="category"
              options={(categories ?? []).map((c) => ({ value: c.slug, label: c.name }))}
            />
          </Suspense>
          <Suspense fallback={null}>
            <SearchField label="Search articles" placeholder="Search articles…" />
          </Suspense>
        </div>

        {params.tag ? (
          <p className="mb-8 text-sm text-[var(--muted)]">
            Filtered by tag <span className="text-[var(--indigo)]">{params.tag}</span>.{" "}
            <Link href="/blog" className="underline underline-offset-4 hover:text-[var(--gold)]">
              Clear
            </Link>
          </p>
        ) : null}

        {featured ? (
          <article className="mb-4 grid gap-8 border-b border-[var(--line)] pb-12 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
            <div className="order-2 flex flex-col justify-center md:order-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-[var(--clay)]">Featured</span>
                {featured.category ? (
                  <span className="text-[var(--gold)]">{featured.category.name}</span>
                ) : null}
                <span className="text-[var(--muted)]">{featured.reading_minutes} min read</span>
              </div>
              <h2 className="mt-3 text-[length:var(--text-xl)] leading-snug md:text-[length:var(--text-2xl)]">
                <Link href={`/blog/${featured.slug}`} className="transition-colors hover:text-[var(--gold)]">
                  {featured.title}
                </Link>
              </h2>
              {featured.excerpt ? (
                <p className="mt-4 max-w-xl leading-relaxed text-[var(--muted)]">{featured.excerpt}</p>
              ) : null}
              {featured.published_at ? (
                <time dateTime={featured.published_at} className="mt-5 text-sm text-[var(--muted)]">
                  {formatFullDate(featured.published_at)}
                </time>
              ) : null}
            </div>

            <Link
              href={`/blog/${featured.slug}`}
              tabIndex={-1}
              aria-hidden="true"
              className="relative order-1 block aspect-[16/10] overflow-hidden rounded-[var(--radius-hair)] bg-[var(--bg-raised)] md:order-2"
            >
              <SmartImage
                src={imageUrl(featured.cover_image)}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
                fallback={
                  <span className="block h-full w-full overflow-hidden text-[var(--text)] opacity-70">
                    <Weave seed={featured.id * 17 + 3} bandCount={7} height={320} className="h-full w-full" />
                  </span>
                }
              />
            </Link>
          </article>
        ) : null}

        {posts.length === 0 && !featured ? (
          <EmptyState
            title={isFiltered ? "No articles matched your search." : "No articles have been published yet."}
            hint={
              isFiltered
                ? "Try a different term, or clear the filters to see everything."
                : "Write your first article in the admin panel and publish it to see it here."
            }
            action={
              isFiltered ? (
                <ButtonLink href="/blog" tone="secondary">Clear filters</ButtonLink>
              ) : (
                <ButtonLink href="/admin">Open the admin panel</ButtonLink>
              )
            }
          />
        ) : (
          <>
            <p className="sr-only" aria-live="polite">
              {data?.total ?? 0} {data?.total === 1 ? "article" : "articles"} found.
            </p>
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Suspense fallback={null}>
              <Pagination page={data?.page ?? 1} pages={data?.pages ?? 1} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
