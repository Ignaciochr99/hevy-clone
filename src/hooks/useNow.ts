import { useEffect, useState } from 'react';

// La hora actual (en milisegundos), actualizada cada `intervalMs`. Sirve para
// cronómetros: el componente se redibuja cada segundo y calcula el tiempo a
// partir de una hora de inicio (ver elapsedSeconds), sin contar ticks.
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
