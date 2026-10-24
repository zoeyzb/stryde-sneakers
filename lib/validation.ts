const EMAIL = /^[^\s@"<>()[\]\\,;:]+@[^\s@"<>()[\]\\,;:]+\.[^\s@"<>()[\]\\,;:]{2,}$/;

export function normaliseEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 254 || !EMAIL.test(email)) return null;
  return email;
}

export const HANDLE = /^[a-z0-9][a-z0-9-]{0,254}$/;
