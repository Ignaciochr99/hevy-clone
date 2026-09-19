const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_SIGNING_CONFIG = `signingConfigs {
        release {
            if (System.getenv('ANDROID_KEYSTORE_PATH')) {
                storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))
                storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
                keyAlias System.getenv('ANDROID_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_KEY_PASSWORD')
            }
        }`;

const RELEASE_SIGNING_USE =
  "signingConfig System.getenv('ANDROID_KEYSTORE_PATH') ? signingConfigs.release : signingConfigs.debug";

function replaceOrThrow(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(`withReleaseSigning: no se encontró ${label} en build.gradle`);
  }
  return source.replace(pattern, replacement);
}

function patchBuildGradle(source) {
  if (source.includes('ANDROID_KEYSTORE_PATH')) {
    return source;
  }

  // 1. buildTypes.release usa la clave propia si las variables de entorno existen.
  let gradle = replaceOrThrow(
    source,
    /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
    `$1${RELEASE_SIGNING_USE}`,
    'buildTypes.release.signingConfig'
  );

  // 2. Se declara signingConfigs.release leyendo las variables de entorno.
  gradle = replaceOrThrow(gradle, /signingConfigs\s*\{/, RELEASE_SIGNING_CONFIG, 'signingConfigs');

  // versionCode y versionName no se tocan aquí: los define app.config.js.
  return gradle;
}

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    mod.modResults.contents = patchBuildGradle(mod.modResults.contents);
    return mod;
  });
}

module.exports = withReleaseSigning;
module.exports.patchBuildGradle = patchBuildGradle;
