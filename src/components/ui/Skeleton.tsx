// un bloque animado que simula la forma del contenido real mientras se espera la respuesta.
// Se ve mucho más profesional que un simple texto "Cargando...".

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-space-800 rounded ${className}`}
      aria-hidden="true"
    />
  );
}