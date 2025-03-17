export function ok(value: unknown, error?: string | Error): asserts value {
  if (!value) {
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'string') {
      throw new Error(error);
    } else {
      throw new Error('Invalid value!');
    }
  }
}
