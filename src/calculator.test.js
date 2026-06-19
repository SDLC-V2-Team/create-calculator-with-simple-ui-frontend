import { operate, createState, formatResult, reduce } from './calculator';

describe('operate', () => {
  test('performs basic addition', () => {
    expect(operate(2, '+', 3)).toBe(5);
  });

  test('throws on division by zero', () => {
    expect(() => operate(10, '/', 0)).toThrow('Division by zero');
  });

  test('throws on unknown operator', () => {
    expect(() => operate(1, '%', 2)).toThrow('Unknown operator: %');
  });
});

describe('formatResult', () => {
  test('formats a finite number as a string', () => {
    expect(formatResult(3.14)).toBe('3.14');
  });

  test('returns "Error" for non-finite values', () => {
    expect(formatResult(Infinity)).toBe('Error');
    expect(formatResult(-Infinity)).toBe('Error');
    expect(formatResult(NaN)).toBe('Error');
  });
});

describe('reduce – sin action', () => {
  test('happy path: sin of π/2 ≈ 1', () => {
    const state = { ...createState(), current: String(Math.PI / 2) };
    const next = reduce(state, { type: 'sin' });
    expect(parseFloat(next.current)).toBeCloseTo(1, 9);
    expect(next.overwrite).toBe(true);
  });

  test('edge case: sin of 0 === 0', () => {
    const state = { ...createState(), current: '0' };
    const next = reduce(state, { type: 'sin' });
    expect(next.current).toBe('0');
    expect(next.overwrite).toBe(true);
  });

  test('edge case: sin of π ≈ 0 (floating point rounded)', () => {
    const state = { ...createState(), current: String(Math.PI) };
    const next = reduce(state, { type: 'sin' });
    // Math.sin(Math.PI) is a very small number close to 0, formatResult rounds it
    expect(parseFloat(next.current)).toBeCloseTo(0, 9);
  });
});

describe('reduce – cos action', () => {
  test('happy path: cos of 0 === 1', () => {
    const state = { ...createState(), current: '0' };
    const next = reduce(state, { type: 'cos' });
    expect(next.current).toBe('1');
    expect(next.overwrite).toBe(true);
  });

  test('edge case: cos of π ≈ -1', () => {
    const state = { ...createState(), current: String(Math.PI) };
    const next = reduce(state, { type: 'cos' });
    expect(parseFloat(next.current)).toBeCloseTo(-1, 9);
    expect(next.overwrite).toBe(true);
  });

  test('error path: cos of a non-numeric current value produces "Error"', () => {
    const state = { ...createState(), current: 'abc' };
    const next = reduce(state, { type: 'cos' });
    expect(next.current).toBe('Error');
    expect(next.overwrite).toBe(true);
  });
});

describe('reduce – sin/cos do not mutate existing state properties unrelated to result', () => {
  test('sin preserves previous and operator from original state', () => {
    const state = { ...createState(), current: '1', previous: 5, operator: '+' };
    const next = reduce(state, { type: 'sin' });
    expect(next.previous).toBe(5);
    expect(next.operator).toBe('+');
  });
});

describe('reduce – clear action resets state', () => {
  test('clear after sin resets to initial state', () => {
    let state = { ...createState(), current: String(Math.PI / 2) };
    state = reduce(state, { type: 'sin' });
    const cleared = reduce(state, { type: 'clear' });
    expect(cleared).toEqual(createState());
  });
});