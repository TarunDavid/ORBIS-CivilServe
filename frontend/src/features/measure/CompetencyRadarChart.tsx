import type { CompetencyCardItem } from './competencyCardApi';

interface Props {
  competencies: CompetencyCardItem[];
  size?: number;
}

export default function CompetencyRadarChart({ competencies, size = 380 }: Props) {
  if (!competencies || competencies.length < 3) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant italic text-sm">
        Insufficient competency points to render radar topology (minimum 3 required).
      </div>
    );
  }

  const center = size / 2;
  const radius = (size / 2) - 45;
  const numAxes = competencies.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Calculate coordinates for a given index and value (1-5)
  const getCoordinates = (index: number, value: number, maxVal = 5) => {
    const angle = (index * angleStep) - (Math.PI / 2); // Start from top
    const r = (value / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate concentric polygon grid points for levels 1 to 5
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map(lvl => {
    return competencies.map((_, i) => {
      const pt = getCoordinates(i, lvl);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  });

  // Target Polygon points
  const targetPoints = competencies.map((comp, i) => {
    const pt = getCoordinates(i, comp.target_proficiency);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  // Current Demonstrated Polygon points
  const currentPoints = competencies.map((comp, i) => {
    const pt = getCoordinates(i, comp.current_proficiency);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric Grid Polygons */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={points}
            fill={idx % 2 === 0 ? 'rgba(0, 0, 0, 0.015)' : 'transparent'}
            stroke="rgba(0, 0, 0, 0.12)"
            strokeWidth="1"
            strokeDasharray={idx === 4 ? 'none' : '3 3'}
          />
        ))}

        {/* Level Number Badges along top axis */}
        {gridLevels.map(lvl => {
          const pt = getCoordinates(0, lvl);
          return (
            <text
              key={`level-lbl-${lvl}`}
              x={center + 6}
              y={pt.y + 4}
              fontSize="10"
              fill="#888888"
              fontFamily="monospace"
              fontWeight="bold"
            >
              L{lvl}
            </text>
          );
        })}

        {/* Radial Axes & Axis Labels */}
        {competencies.map((comp, i) => {
          const axisEnd = getCoordinates(i, 5);
          const labelPt = getCoordinates(i, 5.6);
          const angle = (i * angleStep) - (Math.PI / 2);
          
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          else if (Math.cos(angle) < -0.3) textAnchor = 'end';

          return (
            <g key={`axis-${comp.id}`}>
              {/* Axis Line */}
              <line
                x1={center}
                y1={center}
                x2={axisEnd.x}
                y2={axisEnd.y}
                stroke="rgba(0, 0, 0, 0.15)"
                strokeWidth="1"
              />

              {/* Axis Label */}
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor={textAnchor}
                fontSize="11"
                fontWeight="700"
                fill="#1E293B"
                className="font-jakarta select-none"
              >
                {comp.code}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 12}
                textAnchor={textAnchor}
                fontSize="9.5"
                fill="#64748B"
                className="font-jakarta select-none"
              >
                {comp.name.length > 14 ? `${comp.name.slice(0, 12)}…` : comp.name}
              </text>
            </g>
          );
        })}

        {/* Target Profile Polygon */}
        <polygon
          points={targetPoints}
          fill="rgba(59, 130, 246, 0.12)"
          stroke="#2563EB"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Current Demonstrated Profile Polygon */}
        <polygon
          points={currentPoints}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#059669"
          strokeWidth="2.5"
        />

        {/* Dots on Current Demonstrated Profile */}
        {competencies.map((comp, i) => {
          const pt = getCoordinates(i, comp.current_proficiency);
          const isMet = comp.current_proficiency >= comp.target_proficiency;
          return (
            <g key={`dot-${comp.id}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill={isMet ? '#059669' : '#D97706'}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all hover:scale-125"
              />
            </g>
          );
        })}
      </svg>

      {/* Chart Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-bold font-jakarta">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 border-t-2 border-dashed border-cobalt"></div>
          <span className="text-cobalt">Role Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
          <span className="text-emerald-700">Demonstrated (Evidence)</span>
        </div>
      </div>
    </div>
  );
}
