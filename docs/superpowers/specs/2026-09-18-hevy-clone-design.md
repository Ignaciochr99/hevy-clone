# Clon de Hevy para Android: diseño

Fecha: 2026-09-18
Estado: aprobado por el usuario (pendiente de revisión del documento escrito)

## 1. Objetivo y alcance

App Android de registro de entrenamientos inspirada en Hevy, con dos diferencias y un fin didáctico:

- **Sin límite de rutinas** (Hevy limita las rutinas en su plan gratuito).
- **Local-first:** todos los datos viven en el celular. No hay cuentas, servidor ni sincronización en la nube.
- **Proyecto de aprendizaje:** el usuario es principiante en React Native. Claude escribe el código paso a paso y explica cada concepto. Cada fase produce una lección escrita en `docs/lessons/`.

### Dentro del MVP

- Biblioteca de ejercicios precargada y **ejercicios propios** creados por el usuario.
- Rutinas ilimitadas (crear, editar, borrar).
- Entrenamiento en curso: series (peso, reps, tipo de serie), temporizador de descanso, guardado continuo y recuperación tras cierre de la app.
- Historial de entrenamientos.
- Progreso: récords personales (PRs), gráficas por ejercicio, calendario.
- Medidas corporales.
- Ajustes: unidades kg/lb, exportar e importar todos los datos en JSON.

### Fuera del MVP

- Todo lo social (seguir usuarios, feed, likes, comentarios).
- Cuentas, login y backend en la nube (PostgreSQL).
- Superseries, notificaciones del temporizador con la app cerrada, widgets, Wear OS.
- Modo claro/oscuro configurable (solo tema oscuro).

## 2. Stack

Hevy usa React Native + TypeScript, MobX, React Navigation y Victory Native en el cliente, con Node.js y PostgreSQL en el backend ([oferta de empleo](https://www.hevyapp.com/careers-full-stack-engineer/), [How We Built Hevy](https://www.hevyapp.com/how-we-built-hevy/)). Este proyecto sigue ese stack con dos cambios:

| Área | Elección | Nota |
| --- | --- | --- |
| Framework | React Native + TypeScript, gestionado con Expo | Desarrollo con Expo Go, sin Android Studio ni Java en local |
| Datos | `expo-sqlite` + Drizzle ORM | Sustituye a PostgreSQL: no hay backend |
| Estado | **Zustand** | Sustituye a MobX por ser más simple de enseñar |
| Navegación | React Navigation | Igual que Hevy |
| Gráficas | Victory Native | Igual que Hevy; depende de Skia (riesgo validado en la Fase 0) |
| Tests | Jest | Solo lógica: repositorios, PRs, exportar/importar |

## 3. Arquitectura y modelo de datos

### Capas

1. **Base de datos** (`db/`): SQLite con Drizzle. Única fuente de verdad de lo permanente.
2. **Repositorios** (`repositories/`): funciones TypeScript (`routines.create()`, `workouts.finish()`). Único código que ejecuta consultas.
3. **Stores de Zustand** (`stores/`): estado vivo, sobre todo el entrenamiento en curso. Llaman a los repositorios.
4. **Pantallas y componentes:** leen stores y repositorios, sin SQL.

### Tablas

- `exercises`: id, nombre, grupo muscular, equipo, tipo (peso/reps, solo reps, duración), `is_custom`. La biblioteca precargada y los ejercicios propios conviven en la misma tabla.
- `routines`, `routine_exercises`: rutina, ejercicios en orden, series y reps objetivo. Sin restricción de cantidad.
- `workouts`: inicio, fin, notas.
- `workout_exercises`, `sets`: lo realizado, con peso, reps, tipo de serie (normal, calentamiento, fallo) y si se completó.
- `body_measurements`: peso corporal y medidas con fecha.

### Decisiones

- Los entrenamientos son **copias** de la rutina, no referencias: editar o borrar una rutina no altera el historial.
- Los PRs se **calculan al guardar** el entrenamiento y se almacenan.
- El entrenamiento en curso se **persiste en SQLite en cada cambio**.
- Las migraciones están **versionadas desde el inicio**.

## 4. Pantallas y navegación

Tres pestañas inferiores, cada una con su propio stack:

| Pestaña | Pantallas |
| --- | --- |
| **Inicio** | Resumen semanal, entrenamientos recientes, detalle de un entrenamiento pasado |
| **Rutinas** | Lista de rutinas, crear/editar rutina, empezar entrenamiento vacío, elegir una rutina y empezar |
| **Perfil** | Estadísticas, gráficas, calendario, medidas corporales, ajustes, exportar/importar JSON, biblioteca de ejercicios |

**Selector de ejercicios reutilizable** (biblioteca con búsqueda, filtros y "Crear ejercicio propio"). Se abre desde:

- Crear o editar una rutina.
- Un entrenamiento en curso (para añadir ejercicios, en especial en un entrenamiento vacío).
- Perfil, para gestionar la biblioteca sin iniciar una rutina.

El detalle de un ejercicio (historial y PRs) se abre desde las gráficas del Perfil o al tocar un ejercicio dentro de un entrenamiento.

**Entrenamiento en curso:** pantalla modal sobre las pestañas.

- Una tarjeta por ejercicio con sus series (peso, reps, check).
- Temporizador de descanso que arranca al completar una serie.
- Barra flotante visible en cualquier pestaña mientras haya un entrenamiento activo.
- Al terminar se calculan los PRs y se guarda el entrenamiento.

## 5. Estructura del código

```
src/
  db/            esquema, migraciones, cliente, ejercicios precargados
  repositories/  único acceso a la base de datos
  stores/        Zustand; entrenamiento en curso
  screens/       home, routines, profile, workout, exercises
  components/
  navigation/
  theme/
  utils/         PRs, unidades, exportar/importar
docs/
  lessons/       una lección por fase
  superpowers/specs/
```

Pruebas con Jest sobre repositorios, cálculo de PRs y exportar/importar, escritas antes del código correspondiente (TDD). Las pantallas las prueba el usuario en su celular.

## 6. Fases

Cada fase termina con algo que corre en el celular y con su lección.

0. **Preparación:** proyecto Expo + TypeScript, repositorio en GitHub, app en Expo Go. Validación de una gráfica de Victory Native (riesgo Skia).
1. **Pipeline de build:** GitHub Actions compila, firma y publica un APK vacío en Releases.
2. **Navegación y tema:** 3 pestañas, tema oscuro.
3. **Base de datos:** esquema, migraciones, precarga de ejercicios, repositorios, tests.
4. **Ejercicios:** selector, filtros, ejercicios propios.
5. **Rutinas:** crear, editar, borrar.
6. **Entrenamiento en curso:** store, series, temporizador, guardado continuo, recuperación.
7. **Historial e Inicio:** resumen semanal y detalle de entrenamientos.
8. **Progreso:** PRs, gráficas por ejercicio, calendario.
9. **Medidas, ajustes y exportar/importar JSON.**

Estimación orientativa: 30 a 50 horas de sesión en total. Lo más incierto son las fases 1 y 6.

## 7. Build, distribución y alojamiento gratuito

| Servicio | Uso |
| --- | --- |
| GitHub | Repositorio |
| GitHub Actions | Compilar el APK en la nube |
| GitHub Releases | Publicar e instalar cada APK |
| GitHub Pages (opcional) | Publicar las lecciones como sitio web |

**Flujo de una versión:** `git tag v*` → Actions instala Node y Java, corre los tests, ejecuta `expo prebuild` y Gradle → firma el APK con la clave guardada en GitHub Secrets → lo adjunta a un Release → el usuario lo descarga e instala.

**Costo:** 0 USD. Actions es ilimitado en repositorios públicos; en privados hay 2000 minutos al mes y un build tarda unos 10 a 15 minutos. Se recomienda repositorio público.

**Limitaciones:**

- Android mostrará un aviso de "origen desconocido" o de Play Protect al instalar fuera de Google Play.
- No hay actualización automática: se instala el APK nuevo sobre el anterior, y los datos se conservan si está firmado con la misma clave.

## 8. Riesgos

- **Pérdida de la clave de firma:** impediría actualizar la app sobre la instalada. Habría que desinstalar, lo que borra la base de datos local. Mitigación: guardar la clave en un lugar seguro fuera del repositorio, además de en GitHub Secrets.
- **Pérdida de datos:** al no haber nube, los datos solo existen en el celular. Mitigación: exportar/importar JSON (Fase 9).
- **Victory Native / Skia:** posible incompatibilidad con Expo Go o con el build. Mitigación: validación en la Fase 0.
- **Build nativo en CI:** la firma y `expo prebuild` suelen dar problemas. Mitigación: adelantar el pipeline a la Fase 1.
