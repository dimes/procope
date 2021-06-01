declare module '@onflow/types' {
  export interface Type {
    label: string;
  }

  export const Address: Type;
  export const String: Type;
}

declare module '@onflow/fcl' {
  import { Type } from '@onflow/types';

  export interface User {
    addr: string | null;
    loggedIn: boolean | null;
  }

  export function currentUser(): {
    authorization: (account: any) => any;
    unauthenticate: () => void;
    subscribe: (callback: (user: User) => void) => void;
  };

  export function logIn(): void;
  export function signUp(): void;

  export interface Config {
    put(key: string, val: string): Config;
  }
  export function config(): Config;

  export interface SendResult { }
  export function send(args: any[]): Promise<SendResult>;
  export function script(strings: TemplateStringsArray): string;
  export function transaction(strings: TemplateStringsArray): string;
  export function decode<T = object>(result: SendResult): Promise<T>;

  export interface Arg<T = any> {
    value: T;
    type: Type
  }
  export function arg<T = any>(val: T, type: Type): Arg<T>;
  export function args(args: Arg[]): any;
  export function authz(account: any): any;
  export function payer(payer: (account: any) => any): any;
  export function proposer(proposer: (account: any) => any): any;
  export function authorizations(accounts: ((account: any) => any)[]): any;
  export function limit(limit: number): any;

  export interface Transaction {
    onceSealed(): Promise<void>
  }
  export function tx(txId: string): Transaction;
}
