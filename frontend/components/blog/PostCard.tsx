import Link from "next/link";
import type { PostSummary } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { imageUrl, formatFullDate } from "@/lib/utils";
import { Weave } from "@/components/weave/Weave";

/**
 * Text-forward index entry: a small square cover, not a big tile. Blog
 * previews are scanned in a list, so the title does the work (§53).
 */
export function PostCard({ post }: { post: PostSummary }) {
  const cover = imageUrl(post.cover_image);

  return (
    <article className="group flex gap-5 border-b border-[var(--line)] py-7">
      <Link
        href={`/blog/${post.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-hair)] bg-[var(--bg-raised)] sm:block"
      >
        <SmartImage
          src={cover}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
          fallback={
            <span aria-hidden="true" className="block h-full w-full overflow-hidden text-[var(--text)] opacity-70">
              <Weave seed={post.id * 23 + 7} bandCount={4} height={120} className="h-full w-full" />
            </span>
          }
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[length:var(--text-xs)] text-[var(--muted)]">
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

        <h3 className="mt-2 text-[length:var(--text-lg)] leading-snug">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-[var(--gold)]">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? (
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            {post.excerpt}
          </p>
        ) : null}

        {post.tags.length > 0 ? (
          <ul className="mt-3.5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag.id}>
                <Link
                  href={`/blog?tag=${tag.slug}`}
                  className="rounded-[var(--radius-chip)] border border-[var(--line)] px-2.5 py-0.5 text-[length:var(--text-xs)] text-[var(--muted)] transition-colors hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
