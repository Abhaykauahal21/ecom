// Simplified pass-through wrapper.
// As requested, removed custom retry loops because they conflict with Neon's native pooling and Prisma's connection management, causing 4-5 minute delays.

export async function withRetry<T>(fn: () => Promise<T>, retries = 0): Promise<T> {
  return await fn();
}
