/**
 * Integration tests for CdpSkills.
 * Requires Chrome running with --remote-debugging-port=9222
 *
 * Run: npx jest tests/integration --testTimeout=30000
 * Skip in CI unless CHROME_DEBUG_PORT is set.
 */

const CHROME_PORT = process.env.CHROME_DEBUG_PORT
  ? parseInt(process.env.CHROME_DEBUG_PORT)
  : undefined;

const describeIfChrome = CHROME_PORT ? describe : describe.skip;

describeIfChrome('CdpSkills integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CdpSkills } = require('../../src/CdpSkills');

  it('connects, navigates, and returns a tree', async () => {
    const skills = new CdpSkills({ port: CHROME_PORT });
    await skills.connect();

    try {
      const tree = await skills.navigate('about:blank');
      expect(typeof tree).toBe('string');
    } finally {
      await skills.disconnect();
    }
  }, 30000);
});
