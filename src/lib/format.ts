export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function difficultyClass(difficulty: string) {
  if (difficulty === "EASY") return "badge green";
  if (difficulty === "HARD") return "badge red";
  return "badge amber";
}

export function roleLabel(role: string) {
  return role.replace("_", " ").toLowerCase();
}
