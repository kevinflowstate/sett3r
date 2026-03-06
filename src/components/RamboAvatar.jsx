export default function RamboAvatar({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <rect x="16" y="4" width="32" height="28" rx="4" fill="#1e1e2e" stroke="#39ff14" strokeWidth="1.5"/>
      {/* Eyes */}
      <rect x="22" y="14" width="6" height="4" rx="1" fill="#ff3131"/>
      <rect x="36" y="14" width="6" height="4" rx="1" fill="#ff3131"/>
      {/* Mouth grill */}
      <line x1="24" y1="24" x2="40" y2="24" stroke="#39ff14" strokeWidth="1"/>
      <line x1="24" y1="26" x2="40" y2="26" stroke="#39ff14" strokeWidth="1"/>
      <line x1="24" y1="28" x2="40" y2="28" stroke="#39ff14" strokeWidth="1"/>
      {/* Antenna */}
      <line x1="32" y1="4" x2="32" y2="0" stroke="#39ff14" strokeWidth="1.5"/>
      <circle cx="32" cy="0" r="2" fill="#39ff14"/>
      {/* Body */}
      <rect x="18" y="34" width="28" height="20" rx="3" fill="#1e1e2e" stroke="#39ff14" strokeWidth="1.5"/>
      {/* Chest plate */}
      <rect x="26" y="38" width="12" height="8" rx="2" fill="#0a0a0f" stroke="#ff3131" strokeWidth="1"/>
      <text x="32" y="44" textAnchor="middle" fill="#ff3131" fontSize="5" fontFamily="monospace">WAR</text>
      {/* Arms */}
      <rect x="8" y="36" width="8" height="16" rx="3" fill="#1e1e2e" stroke="#39ff14" strokeWidth="1"/>
      <rect x="48" y="36" width="8" height="16" rx="3" fill="#1e1e2e" stroke="#39ff14" strokeWidth="1"/>
      {/* Ammo belt */}
      <line x1="20" y1="48" x2="44" y2="48" stroke="#ffbf00" strokeWidth="2" strokeDasharray="3 2"/>
      {/* Legs */}
      <rect x="22" y="56" width="8" height="8" rx="2" fill="#1e1e2e" stroke="#39ff14" strokeWidth="1"/>
      <rect x="34" y="56" width="8" height="8" rx="2" fill="#1e1e2e" stroke="#39ff14" strokeWidth="1"/>
    </svg>
  )
}
