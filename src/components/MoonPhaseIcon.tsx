interface MoonPhaseIconProps {
  /** Valor crudo de fase de suncalc: 0 = luna nueva, 0.5 = llena, 1 = nueva otra vez */
  phaseValue: number;
  /** Tamaño del ícono en píxeles */
  size?: number;
  className?: string;
}

export default function MoonPhaseIcon({ phaseValue, size = 48, className = '' }: MoonPhaseIconProps) {
  const r = 50; // radio en el sistema de coordenadas interno del SVG (viewBox fijo)
  const theta = phaseValue * 2 * Math.PI;

  // rx: ancho horizontal del terminador. Su signo determina si la curva
  // "abre" hacia adentro (creciente/menguante fina) o hacia afuera (gibosa).
  const rx = r * Math.cos(theta);

  // Qué mitad del disco (izquierda/derecha) es el lado iluminado "base":
  // antes de la fase 0.5 (nueva → llena) el lado visible que crece es el derecho.
  const outerSweep = phaseValue < 0.5 ? 1 : 0;
  const innerSweep = rx >= 0 ? 1 - outerSweep : outerSweep;

  // Path de la región iluminada: arco exterior (borde del disco) + arco
  // del terminador (elipse de ancho variable), cerrando la figura.
  const path = `
    M 0,${-r}
    A ${r},${r} 0 0,${outerSweep} 0,${r}
    A ${Math.abs(rx)},${r} 0 0,${innerSweep} 0,${-r}
    Z
  `;

  return (
    <svg
      viewBox="-55 -55 110 110"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Ilustración de la fase lunar actual`}
    >
      {/* Disco completo: representa el lado oscuro de la luna (siempre visible como base) */}
      <circle cx={0} cy={0} r={r} fill="#1e293b" stroke="#334155" strokeWidth="1" />

      {/* Región iluminada: se dibuja encima, con el path calculado arriba */}
      <path d={path} fill="#fde68a" />

      {/* Borde sutil para separar el disco del fondo de la card */}
      <circle cx={0} cy={0} r={r} fill="none" stroke="#334155" strokeWidth="1" />
    </svg>
  );
}