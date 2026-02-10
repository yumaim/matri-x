export const HEADER_COLORS = [
  { id: "blue", label: "ブルー", gradient: "from-primary/30 via-accent/20 to-primary/10", banner: "from-indigo-600/40 via-violet-600/40 to-purple-600/40", preview: "bg-gradient-to-r from-blue-500 to-blue-300" },
  { id: "purple", label: "パープル", gradient: "from-purple-600/30 via-pink-500/20 to-purple-400/10", banner: "from-purple-600/40 via-pink-500/40 to-fuchsia-500/40", preview: "bg-gradient-to-r from-purple-500 to-pink-400" },
  { id: "green", label: "グリーン", gradient: "from-emerald-600/30 via-teal-500/20 to-cyan-400/10", banner: "from-emerald-600/40 via-teal-500/40 to-cyan-500/40", preview: "bg-gradient-to-r from-emerald-500 to-cyan-400" },
  { id: "orange", label: "オレンジ", gradient: "from-orange-600/30 via-amber-500/20 to-yellow-400/10", banner: "from-orange-600/40 via-amber-500/40 to-yellow-500/40", preview: "bg-gradient-to-r from-orange-500 to-yellow-400" },
  { id: "red", label: "レッド", gradient: "from-red-600/30 via-rose-500/20 to-pink-400/10", banner: "from-red-600/40 via-rose-500/40 to-pink-500/40", preview: "bg-gradient-to-r from-red-500 to-pink-400" },
] as const;

export type HeaderColorId = (typeof HEADER_COLORS)[number]["id"];

export function getGradient(colorId: string | null | undefined) {
  return HEADER_COLORS.find((c) => c.id === colorId)?.gradient || HEADER_COLORS[0].gradient;
}

export function getBanner(colorId: string | null | undefined) {
  return HEADER_COLORS.find((c) => c.id === colorId)?.banner || HEADER_COLORS[0].banner;
}
