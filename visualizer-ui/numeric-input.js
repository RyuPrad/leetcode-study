/* Strict, side-effect-free parsing for numeric visualizer inputs. */
(() => {
  function integer(text, { min = -Infinity, max = Infinity, label = 'Value' } = {}) {
    if (typeof text !== 'string' || !text.trim()) throw Error(`${label} must be an integer.`);
    const value = Number(text.trim());
    if (!Number.isSafeInteger(value) || value < min || value > max) throw Error(`${label} must be an integer${min !== -Infinity ? ` at least ${min}` : ''}${max !== Infinity ? ` and at most ${max}` : ''}.`);
    return value;
  }
  function list(text, { min = -Infinity, max = Infinity, minLength = 0, json = true, label = 'Array' } = {}) {
    const body = text.trim();
    let values;
    if (!body) values = [];
    else if (json && body.startsWith('[')) {
      try { values = JSON.parse(body); } catch { throw Error(`${label} must be a valid JSON array or comma-separated integers.`); }
      if (!Array.isArray(values) || values.some(value => typeof value !== 'number')) throw Error(`${label} must contain only integers.`);
    } else {
      const tokens = body.split(',');
      if (tokens.some(token => !token.trim())) throw Error(`${label} contains an empty item.`);
      values = tokens.map(token => integer(token, { min, max, label: `${label} item` }));
    }
    if (values.length < minLength || values.some(value => !Number.isSafeInteger(value) || value < min || value > max)) throw Error(`${label} must contain${minLength ? ` at least ${minLength}` : ' only'} valid integers${min !== -Infinity ? ` at least ${min}` : ''}.`);
    return values;
  }
  function parts(text, count, label = 'Input') {
    const values = text.split('|').map(value => value.trim());
    if (values.length !== count) throw Error(`${label} requires ${count} parts separated by |.`);
    return values;
  }
  function optionalParameter(text, fallback, label = 'Input') {
    const values = text.split('|').map(value => value.trim());
    if (values.length > 2) throw Error(`${label} accepts one | separator.`);
    return [values[0], values.length === 2 ? values[1] : fallback];
  }
  window.StudyNumericInput = { integer, list, parts, optionalParameter };
})();
