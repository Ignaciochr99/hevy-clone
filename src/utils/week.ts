// El lunes a las 00:00 (hora local) de la semana de `date`. La semana empieza
// el lunes; getDay() da 0 para el domingo, que cuenta como el último día.
export function startOfWeek(date: Date): Date {
  const daysSinceMonday = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysSinceMonday);
}

// El lunes a las 00:00 de la semana siguiente: el final (excluido) de la semana
// de `date`. Se suma con el constructor de fechas y no con 7 × 24 h para no
// descuadrarse en los cambios de hora de verano.
export function startOfNextWeek(date: Date): Date {
  const start = startOfWeek(date);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
}
