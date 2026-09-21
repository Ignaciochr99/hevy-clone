import { useEffect } from 'react';
import { Vibration } from 'react-native';
import { useActiveWorkout } from '../stores/activeWorkout';

// No dibuja nada: vigila el descanso y, cuando llega a su fin, vibra y lo quita.
// Está en la raíz de la app (no en una pantalla) para que funcione desde
// cualquier pestaña. El temporizador se vuelve a crear cada vez que cambia la
// hora de fin (por ejemplo, con los botones −15 y +15).
export function RestTimerWatcher() {
  const endsAt = useActiveWorkout((state) => state.rest?.endsAt);

  useEffect(() => {
    if (endsAt === undefined) {
      return;
    }
    const id = setTimeout(() => {
      Vibration.vibrate([0, 300, 150, 300]);
      useActiveWorkout.getState().skipRest();
    }, Math.max(0, endsAt - Date.now()));
    return () => clearTimeout(id);
  }, [endsAt]);

  return null;
}
