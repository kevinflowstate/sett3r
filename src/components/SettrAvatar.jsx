export default function SettrAvatar({ size = 64 }) {
  // PS1 low-poly cyborg - lean, angular, humanoid/robot hybrid
  const d = '#1a1a2e'
  const dl = '#252540'
  const ds = '#101020'
  const g = '#39ff14'
  const gd = '#20aa0e'
  const p = '#a855f7'
  const pd = '#7b3bbf'
  const bk = '#0a0a0f'
  const mt = '#3a3a55' // metal highlight
  const sk = '#c4a882' // skin tone (exposed jaw/chin)

  return (
    <svg width={size} height={size} viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>

      {/* === HEAD - half human, half machine === */}
      {/* Skull shape - angular, narrow */}
      <polygon points="24,4 40,4 42,10 42,22 38,26 26,26 22,22 22,10" fill={dl}/>
      {/* Shadow side of head (left = machine side) */}
      <polygon points="24,4 22,10 22,22 26,26 26,4" fill={ds}/>

      {/* Left eye - robotic, square, glowing */}
      <rect x="24" y="12" width="6" height="3" fill={bk}/>
      <rect x="25" y="12.5" width="4" height="2" fill={g}/>
      <rect x="25" y="12.5" width="4" height="2" fill={g} opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite"/>
      </rect>

      {/* Right eye - more human, rounder shape but still angular */}
      <polygon points="35,12 40,12 40,15 35,15" fill={bk}/>
      <polygon points="36,12.5 39,12.5 39,14.5 36,14.5" fill={g}/>

      {/* Circuit lines on left (machine) side of face */}
      <line x1="23" y1="10" x2="23" y2="18" stroke={g} strokeWidth="0.5" opacity="0.5"/>
      <line x1="23" y1="14" x2="25" y2="14" stroke={g} strokeWidth="0.5" opacity="0.5"/>
      <circle cx="23" cy="10" r="0.6" fill={g} opacity="0.6"/>
      <circle cx="23" cy="18" r="0.6" fill={g} opacity="0.6"/>

      {/* Exposed jaw - skin visible on right side (human half) */}
      <polygon points="34,20 42,20 38,26 32,26" fill={sk} opacity="0.6"/>

      {/* Metal jaw plate on left side */}
      <polygon points="22,20 30,20 32,26 26,26" fill={mt}/>
      <line x1="24" y1="22" x2="30" y2="22" stroke={gd} strokeWidth="0.4"/>

      {/* Mouth - thin slit */}
      <line x1="28" y1="23" x2="36" y2="23" stroke={g} strokeWidth="0.6"/>

      {/* Hair - short, sharp, swept back */}
      <polygon points="24,4 32,2 40,4 38,6 26,6" fill={ds}/>
      <polygon points="26,4 32,1 28,4" fill={p} opacity="0.6"/>
      <polygon points="34,4 38,3 36,5" fill={pd} opacity="0.5"/>

      {/* === NECK - mechanical === */}
      <rect x="29" y="26" width="6" height="4" fill={mt}/>
      <line x1="30" y1="27" x2="30" y2="30" stroke={gd} strokeWidth="0.3"/>
      <line x1="34" y1="27" x2="34" y2="30" stroke={gd} strokeWidth="0.3"/>

      {/* === TORSO - lean, athletic, armored === */}
      {/* Core shape - narrow waist, broader shoulders */}
      <polygon points="18,30 46,30 42,52 22,52" fill={dl}/>
      {/* Shadow side */}
      <polygon points="18,30 22,52 20,52 16,32" fill={ds}/>
      {/* Lit edge */}
      <polygon points="46,30 42,52 44,52 48,32" fill={ds}/>

      {/* Chest plate - angular V shape */}
      <polygon points="26,32 38,32 36,40 32,42 28,40" fill={bk} stroke={p} strokeWidth="0.5"/>
      {/* Reactor core / S3T badge */}
      <circle cx="32" cy="37" r="3" fill={bk} stroke={p} strokeWidth="0.5"/>
      <text x="32" y="38.5" textAnchor="middle" fill={p} fontSize="4" fontFamily="monospace" fontWeight="bold">S3</text>

      {/* Ribcage armor lines */}
      <line x1="24" y1="42" x2="28" y2="41" stroke={mt} strokeWidth="0.4"/>
      <line x1="24" y1="44" x2="28" y2="43" stroke={mt} strokeWidth="0.4"/>
      <line x1="36" y1="41" x2="40" y2="42" stroke={mt} strokeWidth="0.4"/>
      <line x1="36" y1="43" x2="40" y2="44" stroke={mt} strokeWidth="0.4"/>

      {/* Shoulders - angular pads, not huge */}
      <polygon points="18,30 10,28 8,34 16,34" fill={dl}/>
      <polygon points="10,28 8,34 6,31" fill={ds}/>
      <polygon points="46,30 54,28 56,34 48,34" fill={dl}/>
      <polygon points="54,28 56,34 58,31" fill={ds}/>
      {/* Shoulder dots */}
      <circle cx="12" cy="31" r="1" fill={g} opacity="0.5"/>
      <circle cx="52" cy="31" r="1" fill={g} opacity="0.5"/>

      {/* === LEFT ARM - lean, holding phone === */}
      {/* Upper arm - mechanical joints visible */}
      <polygon points="16,34 10,34 8,44 14,44" fill={d}/>
      <circle cx="12" cy="34" r="1.5" fill={mt} stroke={gd} strokeWidth="0.3"/>
      {/* Forearm - angled up holding phone */}
      <polygon points="8,44 6,40 4,36 6,34" fill={dl}/>
      <circle cx="7" cy="44" r="1.2" fill={mt} stroke={gd} strokeWidth="0.3"/>
      {/* Hand - angular claw */}
      <polygon points="3,32 6,34 6,36 3,36" fill={mt}/>

      {/* Phone */}
      <rect x="1" y="26" width="5" height="8" fill={bk} stroke={mt} strokeWidth="0.5"/>
      <rect x="1.5" y="27" width="4" height="6" fill={ds}/>
      {/* Messages on screen */}
      <rect x="2" y="27.5" width="3" height="0.8" rx="0.2" fill={g} opacity="0.8"/>
      <rect x="2" y="29" width="2" height="0.8" rx="0.2" fill={pd} opacity="0.6"/>
      <rect x="2" y="30.5" width="2.5" height="0.8" rx="0.2" fill={g} opacity="0.8"/>
      {/* Notification dot */}
      <circle cx="5.5" cy="27" r="0.6" fill="#ff3131"/>

      {/* === RIGHT ARM - lean, holding laptop === */}
      {/* Upper arm */}
      <polygon points="48,34 54,34 56,44 50,44" fill={d}/>
      <circle cx="52" cy="34" r="1.5" fill={mt} stroke={gd} strokeWidth="0.3"/>
      {/* Forearm - extended */}
      <polygon points="56,44 58,42 60,44 58,46" fill={dl}/>
      <circle cx="57" cy="44" r="1.2" fill={mt} stroke={gd} strokeWidth="0.3"/>
      {/* Hand */}
      <polygon points="59,42 62,42 62,46 59,46" fill={mt}/>

      {/* Laptop - compact */}
      <polygon points="56,46 62,44 70,46 64,48" fill={ds} stroke={g} strokeWidth="0.4"/>
      {/* Laptop screen */}
      <polygon points="56,46 54,37 64,35 66,44" fill={bk} stroke={g} strokeWidth="0.4"/>
      {/* Terminal lines */}
      <line x1="56" y1="38" x2="62" y2="37" stroke={g} strokeWidth="0.6" opacity="0.8"/>
      <line x1="56" y1="40" x2="59" y2="39.5" stroke={p} strokeWidth="0.6" opacity="0.5"/>
      <line x1="56" y1="42" x2="63" y2="41" stroke={g} strokeWidth="0.6" opacity="0.8"/>

      {/* === WAIST - narrow === */}
      <polygon points="22,50 42,50 40,54 24,54" fill={bk}/>
      <rect x="30" y="50" width="4" height="4" fill={pd} opacity="0.3"/>

      {/* === LEGS - lean, mechanical joints === */}
      {/* Left leg */}
      <polygon points="24,54 32,54 30,66 22,66" fill={dl}/>
      <polygon points="24,54 22,66 20,66 22,54" fill={ds}/>
      {/* Left knee joint */}
      <circle cx="27" cy="60" r="1.5" fill={mt} stroke={gd} strokeWidth="0.3"/>
      {/* Left boot */}
      <polygon points="20,66 32,66 34,70 18,70" fill={d} stroke={p} strokeWidth="0.4"/>
      <polygon points="18,70 34,70 35,72 17,72" fill={ds}/>

      {/* Right leg */}
      <polygon points="32,54 40,54 42,66 34,66" fill={dl}/>
      <polygon points="40,54 42,66 44,66 42,54" fill={ds}/>
      {/* Right knee joint */}
      <circle cx="37" cy="60" r="1.5" fill={mt} stroke={gd} strokeWidth="0.3"/>
      {/* Right boot */}
      <polygon points="32,66 44,66 46,70 30,70" fill={d} stroke={p} strokeWidth="0.4"/>
      <polygon points="30,70 46,70 47,72 29,72" fill={ds}/>

      {/* === ENERGY DETAILS === */}
      {/* Spine glow line */}
      <line x1="32" y1="30" x2="32" y2="50" stroke={g} strokeWidth="0.3" opacity="0.3"/>

      {/* Pulsing core */}
      <circle cx="32" cy="37" r="1.5" fill={g} opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}
