declare module '@onflow/types' {
  export interface Type {
    label: string;
  }

  export const Address: Type;
}

declare module '@onflow/fcl' {
  import { Type } from '@onflow/types';

  export interface User {
    addr: string | null;
    loggedIn: boolean | null;
  }

  export function currentUser(): {
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
  export function send(args: [string, any]): Promise<SendResult>;
  export function script(strings: TemplateStringsArray): string;
  export function decode<T = object>(result: SendResult): Promise<T>;

  export interface Arg<T = any> {
    value: T;
    type: Type
  }
  export function arg<T = any>(val: T, type: Type): Arg<T>;
  export function args(args: Arg[]): any;
}
