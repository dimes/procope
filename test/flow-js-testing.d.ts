declare module 'flow-js-testing' {
  export function init(path: string): Promise<void>;
  export function getAccountAddress(name: string): Promise<string>;
}