import { formatDuration } from './durationFormatter';
import { describe, expect, it } from '@jest/globals';


describe('durationFormatter', () => {
  [
    { seconds: 0, expected: '0:00' },
    { seconds: 5, expected: '0:05' },
    { seconds: 11, expected: '0:11' },
    { seconds: 52, expected: '0:52' },
    { seconds: 60, expected: '1:00' },
    { seconds: 65, expected: '1:05' },
    { seconds: 605, expected: '10:05' },
    { seconds: 705, expected: '11:45' },
    { seconds: 1200, expected: '20:00' },
    { seconds: 1245, expected: '20:45' },
    { seconds: 3605, expected: '1:00:05' },
    { seconds: 3665, expected: '1:01:05' },
    { seconds: 4205, expected: '1:10:05' },
  ].forEach(input => {
    it(`correctly formats ${input.seconds}s to ${input.expected}`, () => {
      expect(formatDuration(input.seconds)).toEqual(input.expected);
    });
  });
});
