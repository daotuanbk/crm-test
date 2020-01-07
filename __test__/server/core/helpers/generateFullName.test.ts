import { generateFullName } from '@app/core';

describe('generateFullName', () => {
  it('should return full name', () => {
    const names = {
      firstName: 'nguyen',
      lastName: 'tien loi',
    };

    expect(generateFullName(names)).toBe('tien loi nguyen');
  });

  it('should return reverse full name when reverse option is true', () => {
    const names = {
      firstName: 'nguyen',
      lastName: 'tien loi',
    };

    expect(generateFullName(names, true)).toBe('nguyen tien loi');
  });
});
