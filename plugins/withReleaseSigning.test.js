const { patchBuildGradle } = require('./withReleaseSigning');

const SAMPLE = `android {
    defaultConfig {
        applicationId 'com.ic.traininglog'
        versionCode 1
        versionName "1.0.0"
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            signingConfig signingConfigs.debug
            minifyEnabled true
        }
    }
}
`;

describe('patchBuildGradle', () => {
  it('signs the release build with the env keystore when ANDROID_KEYSTORE_PATH is set', () => {
    const out = patchBuildGradle(SAMPLE);
    expect(out).toContain(
      "signingConfig System.getenv('ANDROID_KEYSTORE_PATH') ? signingConfigs.release : signingConfigs.debug"
    );
    expect(out).toContain("storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))");
  });

  it('keeps the debug build type on the debug keystore', () => {
    const out = patchBuildGradle(SAMPLE);
    expect(out).toMatch(/debug \{\s+signingConfig signingConfigs\.debug\s+\}/);
  });

  it('reads versionCode and versionName from the environment with defaults', () => {
    const out = patchBuildGradle(SAMPLE);
    expect(out).toContain("versionCode (System.getenv('ANDROID_VERSION_CODE') ?: '1').toInteger()");
    expect(out).toContain(`versionName System.getenv('ANDROID_VERSION_NAME') ?: "1.0.0"`);
  });

  it('is idempotent', () => {
    const once = patchBuildGradle(SAMPLE);
    expect(patchBuildGradle(once)).toBe(once);
  });

  it('throws if the gradle file has an unexpected shape', () => {
    expect(() => patchBuildGradle('android { }')).toThrow(/withReleaseSigning/);
  });
});
