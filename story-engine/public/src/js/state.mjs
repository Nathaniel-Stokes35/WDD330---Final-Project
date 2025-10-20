const KEY = 'character-info';

export function getCharacter() {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
}

export function setCharacter(info) {
  localStorage.setItem(KEY, JSON.stringify(info));
}

export function setVariable(variable, info) {
    localStorage.setItem(variable, JSON.stringify(info));
}

export function getVariable(variable) {
    const data = localStorage.getItem(variable);
    return data ? JSON.parse(data) : null;
}

export function clearCharacter() {
  localStorage.removeItem(KEY);
}