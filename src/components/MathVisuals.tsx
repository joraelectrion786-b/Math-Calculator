import type { ChapterId } from '../types';

export function Chapter3DEmblem({ chapterId }: { chapterId: ChapterId }) {
  switch (chapterId) {
    case 'numbers':
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="g-num-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="g-num-side" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
          </defs>
          <polygon points="32,8 54,20 32,32 10,20" fill="url(#g-num-top)" />
          <polygon points="10,20 32,32 32,56 10,44" fill="#3B82F6" />
          <polygon points="54,20 54,44 32,56 32,32" fill="url(#g-num-side)" />
          <text x="32" y="23" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">√</text>
        </svg>
      );
    case 'algebra':
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="g-alg-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          <polygon points="32,8 54,48 10,48" fill="url(#g-alg-1)" />
          <polygon points="32,8 54,48 40,56 26,34" fill="#3730A3" opacity="0.65" />
          <text x="32" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700" fontStyle="italic">x²</text>
        </svg>
      );
    case 'measurement':
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="g-mea-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <path d="M16 20 v26 a16 7 0 0 0 32 0 v-26 z" fill="url(#g-mea-body)" />
          <ellipse cx="32" cy="20" rx="16" ry="7" fill="#34D399" />
          <ellipse cx="32" cy="20" rx="11" ry="4.2" fill="#065F46" opacity="0.25" />
        </svg>
      );
    case 'geometry':
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="g-geo-cone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="48" rx="18" ry="6.5" fill="#B45309" />
          <polygon points="32,10 50,48 14,48" fill="url(#g-geo-cone)" />
          <polygon points="32,10 50,48 32,54" fill="#92400E" opacity="0.35" />
        </svg>
      );
    case 'statistics':
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0" aria-hidden="true">
          <rect x="12" y="34" width="10" height="20" rx="2" fill="#2DD4BF" />
          <rect x="27" y="22" width="10" height="32" rx="2" fill="#0D9488" />
          <rect x="42" y="12" width="10" height="42" rx="2" fill="#115E59" />
          <polygon points="12,34 17,30 27,30 22,34" fill="#5EEAD4" />
          <polygon points="27,22 32,18 42,18 37,22" fill="#2DD4BF" />
          <polygon points="42,12 47,8 57,8 52,12" fill="#14B8A6" />
        </svg>
      );
  }
}
