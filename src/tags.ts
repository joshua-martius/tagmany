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
  const existing = [frontmatter.tags, frontmatter.Tags]
    .flatMap((value) => coerceTags(value));

  const merged = [...new Set([...existing, ...incoming].map((tag) => normalizeTag(tag)).filter(Boolean))];

  delete frontmatter.Tags;
  frontmatter.tags = merged;

  return merged;
}
