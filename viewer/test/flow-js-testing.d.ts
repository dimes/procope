declare module 'flow-js-testing' {
  export function deployContractByName(options: { to: string; name: string }): Promise<void>;
  export function executeScript(script: { code: string, args?: any }): Promise<any>;
  export function getAccountAddress(name: string): Promise<string>;
  export function init(path: string, port?: number): Promise<void>;
  export function sendTransaction(transaction: { code: string, args?: any, signers: string[] }): Promise<any>;

  export const emulator: {
    start: (port: number, logging: boolean) => Promise<void>;
    stop: () => Promise<void>;
  };
}