// Mock the calculator module before importing main
const mockReduce = jest.fn();
const mockCreateState = jest.fn();

jest.mock('./calculator.js', () => ({
  createState: mockCreateState,
  reduce: mockReduce,
}));

describe('main.js – UI wiring', () => {
  let display;
  let keysContainer;

  beforeEach(() => {
    // Reset mocks
    mockCreateState.mockReset();
    mockReduce.mockReset();

    // Set up initial state
    mockCreateState.mockReturnValue({ current: '0' });
    mockReduce.mockImplementation((_state, _action) => ({ current: '42' }));

    // Set up DOM
    document.body.innerHTML = `
      <div id="display">0</div>
      <div class="keys">
        <button data-digit="1">1</button>
        <button data-digit="2">2</button>
        <button data-operator="+">+</button>
        <button data-action="equals">=</button>
        <button data-action="clear">C</button>
        <button data-action="decimal">.</button>
        <button data-action="percent">%</button>
      </div>
    `;

    display = document.getElementById('display');
    keysContainer = document.querySelector('.keys');

    // Re-import module to re-run wiring with fresh DOM
    jest.resetModules();
    jest.mock('./calculator.js', () => ({
      createState: mockCreateState,
      reduce: mockReduce,
    }));

    require('./main.js');

    // Trigger DOMContentLoaded so init() runs
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('happy path: clicking a digit button dispatches a digit action and updates display', () => {
    mockReduce.mockReturnValue({ current: '1' });

    const btn = document.querySelector('[data-digit="1"]');
    btn.click();

    expect(mockReduce).toHaveBeenCalledWith(
      expect.objectContaining({ current: '0' }),
      { type: 'digit', payload: '1' }
    );
    expect(document.getElementById('display').textContent).toBe('1');
  });

  test('happy path: clicking an operator button dispatches an operator action', () => {
    mockReduce.mockReturnValue({ current: '1' });

    const opBtn = document.querySelector('[data-operator="+"]');
    opBtn.click();

    expect(mockReduce).toHaveBeenCalledWith(
      expect.objectContaining({ current: '0' }),
      { type: 'operator', payload: '+' }
    );
  });

  test('happy path: keyboard digit key dispatches digit action', () => {
    mockReduce.mockReturnValue({ current: '5' });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));

    expect(mockReduce).toHaveBeenCalledWith(
      expect.objectContaining({ current: '0' }),
      { type: 'digit', payload: '5' }
    );
    expect(document.getElementById('display').textContent).toBe('5');
  });

  test('happy path: keyboard operator key dispatches operator action', () => {
    mockReduce.mockReturnValue({ current: '0' });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }));

    expect(mockReduce).toHaveBeenCalledWith(
      expect.any(Object),
      { type: 'operator', payload: '+' }
    );
  });

  test('happy path: keyboard Enter key dispatches equals action', () => {
    mockReduce.mockReturnValue({ current: '10' });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(mockReduce).toHaveBeenCalledWith(
      expect.any(Object),
      { type: 'equals' }
    );
    expect(document.getElementById('display').textContent).toBe('10');
  });

  test('edge case: keyboard Escape dispatches clear action', () => {
    mockReduce.mockReturnValue({ current: '0' });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(mockReduce).toHaveBeenCalledWith(
      expect.any(Object),
      { type: 'clear' }
    );
  });

  test('edge case: clicking on non-button element inside .keys does not dispatch', () => {
    const callsBefore = mockReduce.mock.calls.length;

    // Simulate a click on the container itself (not a button)
    keysContainer.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(mockReduce.mock.calls.length).toBe(callsBefore);
  });
});