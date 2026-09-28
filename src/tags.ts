export function normalizeTag(tag: string | unknown): string {
  return String(tag ?? '').trim().replace(/^#+/, '').trim();
}

export function normalizeTags(input: string): string[] {
  const normalized = input
    .split(',')
    .map((tag) => normalizeTag(tag))
    .filter((tag) => tag.length > 0);

  return [...new Set(normalized)];
}

export function coerceTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => coerceTags(item));
  }

  if (value instanceof Set) {
    return [...value].flatMap((item) => coerceTags(item));
  }

  if (typeof value === 'string') {
    const tag = normalizeTag(value);
    return tag ? [tag] : [];
  }

  return [];
}

export function mergeTags(frontmatter: Record<string, any>, incoming: string[]): string[] {
  const tagKeys = Object.keys(frontmatter)
    .filter((key) => key.toLowerCase() === 'tags');
  const existing = tagKeys
    .flatMap((key) => coerceTags(frontmatter[key]));

  const merged = [...new Set([...existing, ...incoming].map((tag) => normalizeTag(tag)).filter(Boolean))];

  tagKeys
    .filter((key) => key !== 'tags')
    .forEach((key) => delete frontmatter[key]);
  frontmatter.tags = merged;

  return merged;
}
