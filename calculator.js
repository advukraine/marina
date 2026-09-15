(function () {
  'use strict';

  var ERROR = 'Ошибка';
  var MAX_DIGITS = 12;
  var SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  var valueEl = document.getElementById('value');
  var expressionEl = document.getElementById('expression');
  var keysEl = document.getElementById('keys');

  var state = {
    current: '0',      // введённое число, сырая строка
    accumulator: null, // левый операнд
    operator: null,    // ожидающая операция
    overwrite: true,   // следующая цифра начинает новое число
    repeat: null,      // { operator, operand } для повторного «=»
    expression: '',
    error: false
  };

  // --- вычисления -----------------------------------------------------------

  // Убирает артефакты двоичной арифметики: 0.1 + 0.2 -> 0.3
  function normalize(n) {
    if (!isFinite(n) || n === 0) return n;
    return Number(n.toPrecision(12));
  }

  function compute(a, b, operator) {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function toRaw(n) {
    if (typeof n !== 'number' || !isFinite(n)) return ERROR;
    var abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) {
      return n.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return String(n);
  }

  function currentValue() {
    var n = parseFloat(state.current);
    return isFinite(n) ? n : 0;
  }

  // --- отображение ----------------------------------------------------------

  function group(raw) {
    if (raw === ERROR || raw.indexOf('e') !== -1) return raw;
    var sign = raw.charAt(0) === '-' ? '-' : '';
    var body = sign ? raw.slice(1) : raw;
    var dot = body.indexOf('.');
    var int = dot === -1 ? body : body.slice(0, dot);
    var rest = dot === -1 ? '' : body.slice(dot);
    return sign + int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + rest;
  }

  function render() {
    var shown = group(state.current);
    valueEl.textContent = shown;
    expressionEl.textContent = state.expression;
    valueEl.classList.toggle('is-long', shown.length > 9);
  }

  function fail() {
    state.current = ERROR;
    state.accumulator = null;
    state.operator = null;
    state.repeat = null;
    state.overwrite = true;
    state.error = true;
  }

  function setResult(n) {
    var value = normalize(n);
    if (!isFinite(value)) return fail();
    state.current = toRaw(value);
    state.overwrite = true;
  }

  // --- действия -------------------------------------------------------------

  function clearAll() {
    state.current = '0';
    state.accumulator = null;
    state.operator = null;
    state.overwrite = true;
    state.repeat = null;
    state.expression = '';
    state.error = false;
  }

  function inputDigit(digit) {
    if (state.error) clearAll();

    if (state.overwrite) {
      state.current = digit === '.' ? '0.' : digit;
      state.overwrite = false;
      if (state.operator === null) state.expression = '';
      state.repeat = null;
      return;
    }

    if (digit === '.') {
      if (state.current.indexOf('.') === -1) state.current += '.';
      return;
    }

    if (state.current.replace(/[-.]/g, '').length >= MAX_DIGITS) return;
    state.current = state.current === '0' ? digit : state.current + digit;
  }

  function toggleSign() {
    if (state.error) return;
    if (state.current === '0' || state.current === '0.') return;
    state.current = state.current.charAt(0) === '-'
      ? state.current.slice(1)
      : '-' + state.current;
  }

  function backspace() {
    if (state.error) return clearAll();
    if (state.overwrite) {
      state.current = '0';
      return;
    }
    state.current = state.current.slice(0, -1);
    if (state.current === '' || state.current === '-') {
      state.current = '0';
      state.overwrite = true;
    }
  }

  // Процент «как на калькуляторе»: в сложении и вычитании это доля от
  // первого операнда (200 + 10 % = 220), в остальных случаях — просто /100.
  function percent() {
    if (state.error) return;
    var value = currentValue();
    var result = (state.operator === '+' || state.operator === '-') && state.accumulator !== null
      ? state.accumulator * value / 100
      : value / 100;
    setResult(result);
  }

  function setOperator(operator) {
    if (state.error) return;

    if (state.operator !== null && !state.overwrite) {
      var result = normalize(compute(state.accumulator, currentValue(), state.operator));
      if (!isFinite(result)) {
        state.expression = '';
        return fail();
      }
      state.accumulator = result;
      state.current = toRaw(result);
    } else if (state.accumulator === null || state.operator === null) {
      state.accumulator = currentValue();
    }

    state.operator = operator;
    state.overwrite = true;
    state.repeat = null;
    state.expression = group(toRaw(state.accumulator)) + ' ' + SYMBOLS[operator];
  }

  function equals() {
    if (state.error) return;

    var a, b, operator;

    if (state.operator !== null && state.accumulator !== null) {
      a = state.accumulator;
      b = currentValue();
      operator = state.operator;
    } else if (state.repeat) {
      a = currentValue();
      b = state.repeat.operand;
      operator = state.repeat.operator;
    } else {
      state.expression = group(state.current) + ' =';
      state.overwrite = true;
      return;
    }

    var result = normalize(compute(a, b, operator));
    state.expression = group(toRaw(a)) + ' ' + SYMBOLS[operator] + ' ' + group(toRaw(b)) + ' =';

    if (!isFinite(result)) {
      state.expression = '';
      return fail();
    }

    state.repeat = { operator: operator, operand: b };
    state.accumulator = null;
    state.operator = null;
    state.current = toRaw(result);
    state.overwrite = true;
  }

  function activate(button) {
    if (!button) return;

    switch (button.dataset.action) {
      case 'digit': inputDigit(button.dataset.digit); break;
      case 'operator': setOperator(button.dataset.operator); break;
      case 'equals': equals(); break;
      case 'clear': clearAll(); break;
      case 'sign': toggleSign(); break;
      case 'percent': percent(); break;
      case 'backspace': backspace(); break;
      default: return;
    }

    render();
  }

  // --- ввод -----------------------------------------------------------------

  keysEl.addEventListener('click', function (event) {
    activate(event.target.closest('.key'));
  });

  function buttonForKey(event) {
    var key = event.key;

    if (key >= '0' && key <= '9') return keysEl.querySelector('[data-digit="' + key + '"]');
    if (key === '.' || key === ',') return keysEl.querySelector('[data-digit="."]');
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      return keysEl.querySelector('[data-operator="' + key + '"]');
    }
    if (key === 'Enter' || key === '=') return keysEl.querySelector('[data-action="equals"]');
    if (key === 'Backspace') return keysEl.querySelector('[data-action="backspace"]');
    if (key === 'Escape' || key === 'Delete') return keysEl.querySelector('[data-action="clear"]');
    if (key === '%') return keysEl.querySelector('[data-action="percent"]');
    return null;
  }

  var flashTimers = new WeakMap();

  function flash(button) {
    button.classList.add('is-active');
    clearTimeout(flashTimers.get(button));
    flashTimers.set(button, setTimeout(function () {
      button.classList.remove('is-active');
    }, 120));
  }

  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    var button = buttonForKey(event);
    if (!button) return;

    event.preventDefault();
    flash(button);
    activate(button);
  });

  render();
})();
