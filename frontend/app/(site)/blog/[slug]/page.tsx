import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError, SITE_URL } from "@/lib/api";
import { SmartImage } from "@/components/ui/SmartImage";
import { PostCard } from "@/components/blog/PostCard";
import { CodeEnhancer } from "@/components/blog/CodeEnhancer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareRow } from "@/components/blog/ShareRow";
import { SectionHeading } from "@/components/ui";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { WeaveRule } from "@/components/weave/Weave";
import { imageUrl, altText, formatFullDate, extractHeadings } from "@/lib/utils";
import type { Post } from "@/lib/types";

export const revalidate = 300;

async function load(slug: string): Promise<Post | null> {
  try {
    return await api.post(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) return { title: "Article not found" };

  // Fall back to the article's own data rather than requiring every SEO field (§31).
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;
  const image = post.social_image?.public_url ?? post.cover_image?.public_url;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags.map((t) => t.name),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) notFound();

  const related = await api.relatedPosts(slug);
  const cover = imageUrl(post.cover_image);
  const { html, headings } = extractHeadings(post.content ?? "");
  const url = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt || undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: post.author?.name ? { "@type": "Person", name: post.author.name } : undefined,
    image: post.cover_image?.public_url ? [post.cover_image.public_url] : undefined,
    mainEntityOfPage: url,
    keywords: post.tags.map((t) => t.name).join(", ") || undefined,
  };

  return (
    <article className="pb-8">
      <CodeEnhancer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell pt-12 md:pt-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--gold)]">
          <ArrowLeftIcon size={14} />
          All articles
        </Link>

        {/* Header accent only — no pattern comes near the body text (§18). */}
        <header className="mt-8 max-w-3xl">
          <WeaveRule />
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
            {post.category ? (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="text-[var(--gold)] transition-colors hover:text-[var(--clay)]"
              >
                {post.category.name}
              </Link>
            ) : null}
            {post.published_at ? (
              <time dateTime={post.published_at}>{formatFullDate(post.published_at)}</time>
            ) : null}
            <span>{post.reading_minutes} min read</span>
          </div>

          <h1 className="mt-4 text-[length:var(--text-2xl)] leading-[1.1] md:text-[length:var(--text-3xl)]">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 font-[family-name:var(--font-body)] text-[length:var(--text-md)] leading-relaxed text-[var(--muted)]">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
            {post.author?.name ? (
              <p className="text-sm">
                <span className="text-[var(--muted)]">By </span>
                <span className="font-medium text-[var(--text-strong)]">{post.author.name}</span>
              </p>
            ) : <span />}
            <ShareRow title={post.title} url={url} />
          </div>
        </header>
      </div>

      {cover ? (
        <div className="shell mt-10 max-w-4xl">
          <figure>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--bg-raised)]">
              <SmartImage
                src={cover}
                alt={altText(post.cover_image, post.title)}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
            {post.cover_image?.caption ? (
              <figcaption className="mt-2.5 text-sm text-[var(--muted)]">
                {post.cover_image.caption}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}

      <div className="shell mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
        <div className="min-w-0">
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          {post.tags.length > 0 ? (
            <ul className="mt-14 flex flex-wrap gap-2 border-t border-[var(--line)] pt-8">
              {post.tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/blog?tag=${tag.slug}`}
                    className="rounded-[var(--radius-chip)] border border-[var(--line)] px-3 py-1 text-sm text-[var(--muted)] transition-colors hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
                  >
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {post.updated_at && post.published_at &&
           new Date(post.updated_at) > new Date(post.published_at) ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              Updated {formatFullDate(post.updated_at)}.
            </p>
          ) : null}
        </div>

        <aside className="order-first lg:order-none">
          <TableOfContents headings={headings} />
        </aside>
      </div>

      {related && related.length > 0 ? (
        <div className="shell section">
          <SectionHeading title="Related reading" />
          <div className="border-t border-[var(--line)]">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
