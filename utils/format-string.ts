export const formatPascalCase = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
