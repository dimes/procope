export function qs<T extends HTMLElement>(
  containerOrSelector: HTMLElement | string,
  selector?: string,
): T | null {
  let container: HTMLElement = document.body;
  if (typeof containerOrSelector === 'string') {
    selector = containerOrSelector;
  } else {
    container = containerOrSelector;
  }

  if (!selector) {
    throw new Error('No selector specified');
  }

  return container.querySelector<T>(selector)
}

export function ensureEl<T extends HTMLElement>(
  container: HTMLElement,
  className: string,
  init: () => T,
): T {
  const selector = `.${className}`;
  const existing = qs<T>(container, selector);
  if (existing) {
    return existing;
  }

  let el = init();
  el.classList.add(className);
  container.appendChild(el);
  return el;
}