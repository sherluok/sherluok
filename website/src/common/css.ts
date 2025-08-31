function * classList(args: unknown[]): Generator<string> {
  for (const item of args) {
    if (item) {
      if (typeof item === 'string') {
        for (const cln of item.split(/\s+/)) {
          if (cln) {
            yield cln;
          }
        }
      } else if (typeof item === 'object') {
        if (Array.isArray(item)) {
          yield* classList(item);
        } else {
          for (const [key, condition] of Object.entries(item)) {
            if (condition) {
              for (const cln of key.split(' ')) {
                if (cln) {
                  yield cln;
                }
              }
            }
          }
        }
      }
    }
  }
}

export function classNames(...args: unknown[]): Set<string> {
  return new Set(classList(args));
}

export function cx(...args: unknown[]): string {
  return [...classNames(...args)].join(' ');
}
