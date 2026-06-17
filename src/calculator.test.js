import { operate, createState, formatResult, reduce } from './calculator';

// ─── operate ────────────────────────────────────────────────────────────────

describe('operate', () => {
  test('adds two numbers', () => {
    expect(operate(3, '+', 4)).toBe(7);
  });

  test('subtracts two numbers', () => {
    expect(operate(10, '-', 3)).toBe(7);
  });

  test('multiplies two numbers', () => {
    expect(operate(6, '*', 7)).toBe(42);
  });

  test('divides two numbers', () => {
    expect(operate(20, '/', 4)).toBe(5);
  });

  test('throws on division by zero', () => {
    expect(() => operate(5, '/', 0)).toThrow('Division by zero');
  });

  test('throws on unknown operator', () => {
    expect(() => operate(5, '%', 2)).toThrow('Unknown operator: %');
  });
});

// ─── createState ─────────────────────────────────────────────────────────────

describe('createState', () => {
  test('returns a fresh default state', () => {
    const state = createState();
    expect(state).toEqual({
      current: '0',
      previous: null,
      operator: null,
      overwrite: false,
    });
  });

  test('returns a new object each call', () => {
    const s1 = createState();
    const s2 = createState();
    expect(s1).not.toBe(s2);
  });
});

// ─── formatResult ─────────────────────────────────────────────────────────────

describe('formatResult', () => {
  test('formats an integer result', () => {
    expect(formatResult(42)).toBe('42');
  });

  test('formats a floating point result', () => {
    expect(formatResult(0.1 + 0.2)).toBe('0.3');
  });

  test('returns "Error" for Infinity', () => {
    expect(formatResult(Infinity)).toBe('Error');
  });

  test('returns "Error" for -Infinity', () => {
    expect(formatResult(-Infinity)).toBe('Error');
  });

  test('returns "Error" for NaN', () => {
    expect(formatResult(NaN)).toBe('Error');
  });
});

// ─── reduce ──────────────────────────────────────────────────────────────────

describe('reduce', () => {
  test('digit action appends a digit to "0"', () => {
    const state = createState();
    const next = reduce(state, { type: 'digit', payload: '5' });
    expect(next.current).toBe('5');
  });

  test('digit action appends to existing current value', () => {
    const state = { ...createState(), current: '1' };
    const next = reduce(state, { type: 'digit', payload: '2' });
    expect(next.current).toBe('12');
  });

  test('decimal action adds a decimal point', () => {
    const state = createState();
    const next = reduce(state, { type: 'decimal' });
    expect(next.current).toBe('0.');
  });

  test('decimal action does not add a second decimal point', () => {
    const state = { ...createState(), current: '1.' };
    const next = reduce(state, { type: 'decimal' });
    expect(next.current).toBe('1.');
  });

  test('operator action stores previous value and sets operator', () => {
    const state = { ...createState(), current: '8' };
    const next = reduce(state, { type: 'operator', payload: '+' });
    expect(next.previous).toBe(8);
    expect(next.operator).toBe('+');
    expect(next.overwrite).toBe(true);
  });

  test('equals action computes the result', () => {
    let state = createState();
    state = reduce(state, { type: 'digit', payload: '6' });
    state = reduce(state, { type: 'operator', payload: '*' });
    state = reduce(state, { type: 'digit', payload: '7' });
    state = reduce(state, { type: 'equals' });
    expect(state.current).toBe('42');
    expect(state.operator).toBeNull();
    expect(state.previous).toBeNull();
    expect(state.overwrite).toBe(true);
  });

  test('equals action is a no-op when no operator is set', () => {
    const state = { ...createState(), current: '5' };
    const next = reduce(state, { type: 'equals' });
    expect(next.current).toBe('5');
    expect(next.operator).toBeNull();
  });

  test('clear action resets to initial state', () => {
    const state = { current: '99', previous: 10, operator: '+', overwrite: true };
    const next = reduce(state, { type: 'clear' });
    expect(next).toEqual(createState());
  });

  test('sign action negates the current value', () => {
    const state = { ...createState(), current: '5' };
    const next = reduce(state, { type: 'sign' });
    expect(next.current).toBe('-5');
  });

  test('percent action divides current value by 100', () => {
    const state = { ...createState(), current: '50' };
    const next = reduce(state, { type: 'percent' });
    expect(next.current).toBe('0.5');
  });

  test('chained operations compute correctly', () => {
    let state = createState();
    state = reduce(state, { type: 'digit', payload: '5' });
    state = reduce(state, { type: 'operator', payload: '+' });
    state = reduce(state, { type: 'digit', payload: '3' });
    state = reduce(state, { type: 'operator', payload: '*' });
    // at this point 5+3 should have been evaluated => 8
    expect(state.previous).toBe(8);
    state = reduce(state, { type: 'digit', payload: '2' });
    state = reduce(state, { type: 'equals' });
    expect(state.current).toBe('16');
  });

  test('divide by zero via reduce sets current to "Error"', () => {
    let state = createState();
    state = reduce(state, { type: 'digit', payload: '9' });
    state = reduce(state, { type: 'operator', payload: '/' });
    state = reduce(state, { type: 'digit', payload: '0' });
    state = reduce(state, { type: 'equals' });
    expect(state.current).toBe('Error');
  });

  test('overwrite flag causes next digit to replace current', () => {
    const state = { ...createState(), current: '42', overwrite: true };
    const next = reduce(state, { type: 'digit', payload: '7' });
    expect(next.current).toBe('7');
    expect(next.overwrite).toBe(false);
  });

  test('unknown action type returns state unchanged', () => {
    const state = createState();
    const next = reduce(state, { type: 'unknown_action' });
    expect(next).toEqual(state);
  });
});