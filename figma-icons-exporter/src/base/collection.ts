export class MapSet<K, V> {
  #map = new Map<K, Set<V>>();

  add(key: K, value: V): void {
    const set = this.#map.get(key);
    if (set) {
      set.add(value);
    } else {
      this.#map.set(key, new Set([value]));
    }
  }

  remove(key: K, value: V): boolean {
    const set = this.#map.get(key);
    if (set) {
      return set.delete(value);
    }
    return false;
  }

  entries(): IterableIterator<[K, Set<V>]> {
    return this.#map.entries();
  }
}
