// Pure arithmetic engine for the calculator (FR-001).
// Kept free of DOM dependencies so it can be unit tested in isolation.

/**
 * Performs a single binary arithmetic operation.
 * @param {number} a - left operand
 * @param {string} operator - one of '+', '-', '*', '/'
 * @param {number} b - right operand
 * @returns {number} result of the operation
 * @throws {Error} when dividing by zero or given an unknown operator
 */
export function operate(a, operator, b) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) {
        throw new Error('Division by zero');
      }
      return a / b;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

/**
 * Creates a fresh calculator state object.
 * @returns {{current: string, previous: (number|null), operator: (string|null), overwrite: boolean}}
 */
export function createState() {
  return {
    current: '0',
    previous: null,
    operator: null,
    overwrite: false,
  };
}

/**
 * Formats a numeric result for display, avoiding floating point noise.
 * @param {number} value
 * @returns {string}
 */
export function formatResult(value) {
  if (!isFinite(value)) return 'Error';
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

/**
 * Stateless reducer that applies an input action to calculator state.
 * @param {object} state - current state from createState()
 * @param {object} action - { type, payload }
 * @returns {object} the next state (new object)
 */
export function reduce(state, action) {
  const next = { ...state };
  switch (action.type) {
    case 'digit':
      return inputDigit(next, action.payload);
    case 'decimal':
      return inputDecimal(next);
    case 'operator':
      return inputOperator(next, action.payload);
    case 'equals':
      return inputEquals(next);
    case 'clear':
      return createState();
    case 'sign':
      next.current = formatResult(parseFloat(next.current) * -1);
      return next;
    case 'percent':
      next.current = formatResult(parseFloat(next.current) / 100);
      return next;
    case 'sin':
      return inputUnary(next, Math.sin);
    case 'cos':
      return inputUnary(next, Math.cos);
    default:
      return next;
  }
}

/**
 * Applies a unary math function (e.g. Math.sin, Math.cos) to the current value.
 * Input is interpreted in radians, consistent with native JS Math behaviour.
 * @param {object} state - current calculator state
 * @param {function(number): number} fn - the unary function to apply
 * @returns {object} the mutated state
 */
function inputUnary(state, fn) {
  const value = parseFloat(state.current);
  if (isNaN(value)) {
    state.current = 'Error';
  } else {
    state.current = formatResult(fn(value));
  }
  state.overwrite = true;
  return state;
}

function inputDigit(state, digit) {
  if (state.overwrite) {
    state.current = digit;
    state.overwrite = false;
  } else {
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  return state;
}

function inputDecimal(state) {
  if (state.overwrite) {
    state.current = '0.';
    state.overwrite = false;
    return state;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
  }
  return state;
}

function inputOperator(state, operator) {
  const value = parseFloat(state.current);
  if (state.previous !== null && state.operator && !state.overwrite) {
    const result = operate(state.previous, state.operator, value);
    state.previous = result;
    state.current = formatResult(result);
  } else {
    state.previous = value;
  }
  state.operator = operator;
  state.overwrite = true;
  return state;
}

function inputEquals(state) {
  if (state.operator === null || state.previous === null) {
    return state;
  }
  const value = parseFloat(state.current);
  try {
    const result = operate(state.previous, state.operator, value);
    state.current = formatResult(result);
  } catch (err) {
    state.current = 'Error';
  }
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  return state;
}
