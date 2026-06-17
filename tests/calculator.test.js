import { describe, it, expect } from 'vitest';
import { operate, createState, reduce, formatResult } from '../src/calculator.js';

describe('operate', () => {
  it('adds', () => expect(operate(2, '+', 3)).toBe(5));
  it('subtracts', () => expect(operate(5, '-', 2)).toBe(3));
  it('multiplies', () => expect(operate(4, '*', 3)).toBe(12));
  it('divides', () => expect(operate(10, '/', 2)).toBe(5));
  it('throws on divide by zero', () => expect(() => operate(1, '/', 0)).toThrow());
  it('throws on unknown operator', () => expect(() => operate(1, '?', 2)).toThrow());
});

describe('formatResult', () => {
  it('removes float noise', () => expect(formatResult(0.1 + 0.2)).toBe('0.3'));
  it('returns Error for infinity', () => expect(formatResult(Infinity)).toBe('Error'));
});

describe('reduce', () => {
  it('builds a multi-digit number', () => {
    let s = createState();
    s = reduce(s, { type: 'digit', payload: '1' });
    s = reduce(s, { type: 'digit', payload: '2' });
    expect(s.current).toBe('12');
  });

  it('computes a full expression', () => {
    let s = createState();
    s = reduce(s, { type: 'digit', payload: '7' });
    s = reduce(s, { type: 'operator', payload: '+' });
    s = reduce(s, { type: 'digit', payload: '3' });
    s = reduce(s, { type: 'equals' });
    expect(s.current).toBe('10');
  });

  it('clears state', () => {
    let s = createState();
    s = reduce(s, { type: 'digit', payload: '9' });
    s = reduce(s, { type: 'clear' });
    expect(s.current).toBe('0');
  });
});
