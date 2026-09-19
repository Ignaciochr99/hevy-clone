const withEnv = require('./app.config');

const BASE = {
  name: 'Training Log',
  version: '1.0.0',
  android: { package: 'com.ic.traininglog', predictiveBackGestureEnabled: false },
};

describe('app.config', () => {
  const saved = {
    code: process.env.ANDROID_VERSION_CODE,
    name: process.env.ANDROID_VERSION_NAME,
  };

  afterEach(() => {
    for (const [key, value] of [
      ['ANDROID_VERSION_CODE', saved.code],
      ['ANDROID_VERSION_NAME', saved.name],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('falls back to versionCode 1 and the app.json version without env vars', () => {
    delete process.env.ANDROID_VERSION_CODE;
    delete process.env.ANDROID_VERSION_NAME;
    const out = withEnv({ config: BASE });
    expect(out.android.versionCode).toBe(1);
    expect(out.version).toBe('1.0.0');
  });

  it('takes versionCode as a number and version from the environment', () => {
    process.env.ANDROID_VERSION_CODE = '7';
    process.env.ANDROID_VERSION_NAME = '0.1.1';
    const out = withEnv({ config: BASE });
    expect(out.android.versionCode).toBe(7);
    expect(out.version).toBe('0.1.1');
  });

  it('ignores a non-numeric versionCode', () => {
    process.env.ANDROID_VERSION_CODE = 'abc';
    const out = withEnv({ config: BASE });
    expect(out.android.versionCode).toBe(1);
  });

  it('keeps the rest of the config untouched', () => {
    const out = withEnv({ config: BASE });
    expect(out.name).toBe('Training Log');
    expect(out.android.package).toBe('com.ic.traininglog');
    expect(out.android.predictiveBackGestureEnabled).toBe(false);
  });
});
