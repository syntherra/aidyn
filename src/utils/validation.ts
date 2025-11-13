export function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function passwordScore(v: string) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s;
}

export function passwordLabel(s: number) {
  if (s <= 1) return "Very Weak";
  if (s === 2) return "Weak";
  if (s === 3) return "Medium";
  if (s === 4) return "Strong";
  return "Very Strong";
}

