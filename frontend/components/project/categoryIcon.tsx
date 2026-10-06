import {
  ChartIcon, ModelIcon, LayersIcon, TextIcon, MapIcon, CodeIcon,
  type IconProps,
} from "@/components/ui/icons";

/**
 * A marker for a project's category. Categories are free text in the admin,
 * so this matches on keywords rather than an enum, and falls back to a neutral
 * mark for anything unrecognised.
 */
const RULES: [RegExp, (p: IconProps) => React.ReactElement][] = [
  [/deep|neural|vision|cnn|transformer/i, LayersIcon],
  [/nlp|language|text|sentiment|llm/i, TextIcon],
  [/geo|spatial|satellite|map|remote sensing/i, MapIcon],
  [/analytic|dashboard|report|bi\b|visuali/i, ChartIcon],
  [/machine learning|ml\b|model|forecast|predict|risk/i, ModelIcon],
  [/engineer|pipeline|etl|data platform/i, CodeIcon],
];

export function CategoryIcon({ category, size = 16 }: { category: string | null; size?: number }) {
  if (!category) return <ModelIcon size={size} />;
  const match = RULES.find(([pattern]) => pattern.test(category));
  const Icon = match ? match[1] : ModelIcon;
  return <Icon size={size} />;
}

/** The icon in a bordered square, as a section marker on cards and rows. */
export function CategoryBadge({ category }: { category: string | null }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-tile)] border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--gold)]">
      <CategoryIcon category={category} size={17} />
    </span>
  );
}
