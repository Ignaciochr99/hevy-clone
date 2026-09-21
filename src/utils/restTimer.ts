// Lo que suman o restan los botones −15 y +15 del descanso.
export const REST_ADJUST_SECONDS = 15;

// Segundos que faltan para `endsAt` (milisegundos). Se redondea hacia arriba
// para que el contador no marque 0 mientras todavía queda algo de tiempo, y
// nunca es negativo. Como el cronómetro del entrenamiento, se calcula a partir
// de la hora de fin, no contando ticks: es correcto aunque la app haya estado
// en segundo plano.
export function restRemainingSeconds(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function isRestFinished(endsAt: number, now: number): boolean {
  return now >= endsAt;
}

// Mueve el final del descanso `deltaSeconds` (positivo o negativo). Restar de
// más lo deja terminado ahora mismo, nunca en el pasado.
export function adjustRestEnd(endsAt: number, deltaSeconds: number, now: number): number {
  return Math.max(now, endsAt + deltaSeconds * 1000);
}
