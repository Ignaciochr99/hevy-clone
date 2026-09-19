// Expo lee app.json y pasa su contenido aquí como `config`.
// En CI, el workflow define ANDROID_VERSION_CODE y ANDROID_VERSION_NAME, y
// `expo prebuild` escribe esos valores como literales en el build.gradle.
module.exports = ({ config }) => {
  const versionCode = Number.parseInt(process.env.ANDROID_VERSION_CODE ?? '', 10);

  return {
    ...config,
    version: process.env.ANDROID_VERSION_NAME || config.version,
    android: {
      ...config.android,
      versionCode: Number.isNaN(versionCode) ? 1 : versionCode,
    },
  };
};
