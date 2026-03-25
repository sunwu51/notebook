// In-memory cache for Responses API output items.
// Resolves `item_reference` in subsequent requests by inlining the actual item.

const MAX_ITEMS = 5000;
const cache = new Map<string, unknown>();

export function cacheResponseItems(output: unknown) {
  if (!Array.isArray(output)) return;
  for (const item of output) {
    if (item && typeof item === "object" && "id" in item && item.id) {
      cache.set(item.id as string, item);
    }
  }
  // Evict oldest when cache is too large
  if (cache.size > MAX_ITEMS) {
    const toDelete = cache.size - MAX_ITEMS;
    const iter = cache.keys();
    for (let i = 0; i < toDelete; i++) {
      const key = iter.next().value;
      if (key) cache.delete(key);
    }
  }
}

export function resolveItemReferences(input: unknown[]): unknown[] {
  return input.flatMap((item) => {
    if (item && typeof item === "object" && "type" in item && (item as any).type === "item_reference") {
      const id = (item as any).id;
      const cached = id ? cache.get(id) : undefined;
      return cached ? [cached] : [];
    }
    return [item];
  });
}
