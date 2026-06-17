// Entry point: wires the DOM to the pure calculator engine.
import { createState, reduce } from './calculator.js';

let state = createState();
const display = document.getElementById('display');

function render() {
  display.textContent = state.current;
}

function dispatch(action) {
  state = reduce(state, action);
  render();
}

function handleClick(event) {
  const target = event.target.closest('button');
  if (!target) return;

  if (target.dataset.digit !== undefined) {
    dispatch({ type: 'digit', payload: target.dataset.digit });
  } else if (target.dataset.operator !== undefined) {
    dispatch({ type: 'operator', payload: target.dataset.operator });
  } else if (target.dataset.action) {
    dispatch({ type: target.dataset.action });
  }
}

function handleKeyboard(event) {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    dispatch({ type: 'digit', payload: key });
  } else if (['+', '-', '*', '/'].includes(key)) {
    dispatch({ type: 'operator', payload: key });
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    dispatch({ type: 'equals' });
  } else if (key === '.') {
    dispatch({ type: 'decimal' });
  } else if (key === 'Escape') {
    dispatch({ type: 'clear' });
  } else if (key === '%') {
    dispatch({ type: 'percent' });
  }
}

function init() {
  const keys = document.querySelector('.keys');
  keys.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeyboard);
  render();
}

document.addEventListener('DOMContentLoaded', init);
