const BRAND = '#0061A5'

export function MedicineBottle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 68" fill="none" className={className}>
      <rect x="14" y="0" width="24" height="10" rx="3" fill={BRAND} />
      <rect x="4" y="12" width="44" height="56" rx="6" fill="none" stroke={BRAND} strokeWidth="4" />
      <rect x="12" y="35" width="28" height="6" rx="2" fill={BRAND} />
      <rect x="23" y="24" width="6" height="28" rx="2" fill={BRAND} />
    </svg>
  )
}
