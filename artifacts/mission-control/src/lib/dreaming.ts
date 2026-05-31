export async function getDreamingState(): Promise<{ ok: boolean; enabled: boolean; message?: string }> {
  return { ok: true, enabled: false };
}

export async function toggleDreaming(): Promise<{ ok: boolean; enabled: boolean; message: string }> {
  return { ok: true, enabled: true, message: "Dreaming enabled" };
}
