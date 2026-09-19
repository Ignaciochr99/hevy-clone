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

  it('leaves versionCode and versionName as literals (app.config.js sets them)', () => {
    const out = patchBuildGradle(SAMPLE);
    expect(out).toContain('versionCode 1');
    expect(out).toContain('versionName "1.0.0"');
    expect(out).not.toContain('ANDROID_VERSION');
  });

  it('is idempotent', () => {
    const once = patchBuildGradle(SAMPLE);
    expect(patchBuildGradle(once)).toBe(once);
  });

  it('throws if the gradle file has an unexpected shape', () => {
    expect(() => patchBuildGradle('android { }')).toThrow(/withReleaseSigning/);
  });
});
