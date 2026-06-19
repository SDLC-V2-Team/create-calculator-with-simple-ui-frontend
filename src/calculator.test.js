import { operate, createState, formatResult, reduce } from './calculator';

// ─── operate ────────────────────────────────────────────────────────────────

describe('operate', () => {
  test('adds two numbers', () => {
    expect(operate(2, '+', 3)).toBe(5);
  });

  test('subtracts two numbers', () => {
    expect(operate(10, '-', 4)).toBe(6);
  });

  test('multiplies two numbers', () => {
    expect(operate(3, '*', 7)).toBe(21);
  });

  test('divides two numbers', () => {
    expect(operate(10, '/', 2)).toBe(5);
  });

  test('throws on division by zero', () => {
    expect(() => operate(5, '/', 0)).toThrow('Division by zero');
  });

  test('throws on unknown operator', () => {
    expect(() => operate(5, '%', 2)).toThrow('Unknown operator: %');
  });
});

// ─── createState ────────────────────────────────────────────────────────────

describe('createState', () => {
  test('returns a fresh default state object', () => {
    const state = createState();
    expect(state).toEqual({
      current: '0',
      previous: null,
      operator: null,
      overwrite: false,
    });
  });

  test('returns a new object each call', () => {
    const a = createState();
    const b = createState();
    expect(a).not.toBe(b);
  });
});

// ─── formatResult ────────────────────────────────────────────────────────────

describe('formatResult', () => {
  test('formats an integer result', () => {
    expect(formatResult(42)).toBe('42');
  });

  test('rounds floating point noise', () => {
    // 0.1 + 0.2 in JS = 0.30000000000000004
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

// ─── reduce – basic actions ──────────────────────────────────────────────────

describe('reduce – digit', () => {
  test('appends a digit to the current display', () => {
    const state = createState();
    const next = reduce(state, { type: 'digit', payload: '5' });
    expect(next.current).toBe('5');
  });

  test('replaces display when overwrite flag is set', () => {
    const state = { ...createState(), current: '3', overwrite: true };
    const next = reduce(state, { type: 'digit', payload: '9' });
    expect(next.current).toBe('9');
    expect(next.overwrite).toBe(false);
  });
});

describe('reduce – decimal', () => {
  test('appends a decimal point', () => {
    const state = createState();
    const next = reduce(state, { type: 'decimal' });
    expect(next.current).toBe('0.');
  });

  test('does not add a second decimal point', () => {
    const state = { ...createState(), current: '3.' };
    const next = reduce(state, { type: 'decimal' });
    expect(next.current).toBe('3.');
  });
});

describe('reduce – operator', () => {
  test('stores the operator and marks overwrite', () => {
    const state = { ...createState(), current: '4' };
    const next = reduce(state, { type: 'operator', payload: '+' });
    expect(next.operator).toBe('+');
    expect(next.previous).toBe(4);
    expect(next.overwrite).toBe(true);
  });
});

describe('reduce – equals', () => {
  test('computes the result of a pending operation', () => {
    let state = createState();
    state = reduce(state, { type: 'digit', payload: '6' });
    state = reduce(state, { type: 'operator', payload: '*' });
    state = reduce(state, { type: 'digit', payload: '7' });
    state = reduce(state, { type: 'equals' });
    expect(state.current).toBe('42');
    expect(state.operator).toBeNull();
    expect(state.previous).toBeNull();
  });

  test('sets current to "Error" on divide by zero', () => {
    let state = createState();
    state = reduce(state, { type: 'digit', payload: '5' });
    state = reduce(state, { type: 'operator', payload: '/' });
    state = reduce(state, { type: 'digit', payload: '0' });
    state = reduce(state, { type: 'equals' });
    expect(state.current).toBe('Error');
  });

  test('is a no-op when no operator is pending', () => {
    const state = { ...createState(), current: '7' };
    const next = reduce(state, { type: 'equals' });
    expect(next.current).toBe('7');
  });
});

describe('reduce – clear', () => {
  test('resets state to initial values', () => {
    let state = createState();
    state = reduce(state, { type: 'digit', payload: '9' });
    state = reduce(state, { type: 'operator', payload: '+' });
    const next = reduce(state, { type: 'clear' });
    expect(next).toEqual(createState());
  });
});

describe('reduce – sign', () => {
  test('negates the current value', () => {
    const state = { ...createState(), current: '5' };
    const next = reduce(state, { type: 'sign' });
    expect(next.current).toBe('-5');
  });
});

describe('reduce – percent', () => {
  test('divides the current value by 100', () => {
    const state = { ...createState(), current: '50' };
    const next = reduce(state, { type: 'percent' });
    expect(next.current).toBe('0.5');
  });
});

// ─── reduce – sin / cos (FR-001 / FR-002) ────────────────────────────────────

describe('reduce – sin', () => {
  test('computes sine of the current value (radians)', () => {
    const state = { ...createState(), current: String(Math.PI / 2) };
    const next = reduce(state, { type: 'sin' });
    expect(parseFloat(next.current)).toBeCloseTo(1, 9);
    expect(next.overwrite).toBe(true);
  });

  test('sin of 0 is 0', () => {
    const state = { ...createState(), current: '0' };
    const next = reduce(state, { type: 'sin' });
    expect(next.current).toBe('0');
  });

  test('sets current to "Error" when current is not a number', () => {
    const state = { ...createState(), current: 'abc' };
    const next = reduce(state, { type: 'sin' });
    expect(next.current).toBe('Error');
    expect(next.overwrite).toBe(true);
  });
});

describe('reduce – cos', () => {
  test('computes cosine of the current value (radians)', () => {
    const state = { ...createState(), current: '0' };
    const next = reduce(state, { type: 'cos' });
    expect(parseFloat(next.current)).toBeCloseTo(1, 9);
    expect(next.overwrite).toBe(true);
  });

  test('cos of PI is -1', () => {
    const state = { ...createState(), current: String(Math.PI) };
    const next = reduce(state, { type: 'cos' });
    expect(parseFloat(next.current)).toBeCloseTo(-1, 9);
  });

  test('sets current to "Error" when current is not a number', () => {
    const state = { ...createState(), current: 'Error' };
    const next = reduce(state, { type: 'cos' });
    expect(next.current).toBe('Error');
    expect(next.overwrite).toBe(true);
  });
});

// ─── reduce – unknown action ──────────────────────────────────────────────────

describe('reduce – unknown action', () => {
  test('returns a copy of the state unchanged for an unknown action type', () => {
    const state = { ...createState(), current: '3' };
    const next = reduce(state, { type: 'UNKNOWN' });
    expect(next.current).toBe('3');
    expect(next).not.toBe(state); // new object
  });
});