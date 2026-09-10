const SECTOR_ORDER = [
  "Financial",
  "Tech",
  "Consumer",
  "Power",
  "Pipe",
  "Others",
];

export const sectorColor = (sector: string): string => {
  const index = SECTOR_ORDER.indexOf(sector);

  return `var(--chart-${index === -1 ? 1 : index + 1})`;
};

export const initials = (name: string): string => {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};
