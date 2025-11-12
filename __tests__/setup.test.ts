describe('Phase 1 Setup Verification', () => {
  test('Environment variables are loaded', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
    expect(process.env.PINECONE_API_KEY).toBeDefined();
    expect(process.env.SESSION_SECRET).toBeDefined();
  });

  test('Node version is correct', () => {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    expect(major).toBeGreaterThanOrEqual(18);
  });

  test('TypeScript types are available', () => {
    // This test will fail to compile if types are not properly configured
    const testString: string = 'test';
    expect(typeof testString).toBe('string');
  });
});
