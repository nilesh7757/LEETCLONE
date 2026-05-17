import { getStarterCode, languages } from '@/lib/starterCode';

describe('starterCode.ts', () => {
  it('should return correct templates for supported languages', () => {
    expect(getStarterCode('javascript')).toContain('// Write your solution below');
    expect(getStarterCode('python')).toContain('import sys');
    expect(getStarterCode('cpp')).toContain('#include <bits/stdc++.h>');
    expect(getStarterCode('java')).toContain('public class Main');
  });

  it('should return empty string for unsupported language', () => {
    expect(getStarterCode('cobol')).toBe('');
  });

  it('should have a list of supported languages', () => {
    expect(languages.length).toBeGreaterThan(0);
    expect(languages.find(l => l.value === 'javascript')).toBeDefined();
  });
});
