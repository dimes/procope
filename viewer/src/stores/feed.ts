import { arg, args, decode, send, script } from '@onflow/fcl';
import { Address } from '@onflow/types';

export interface Post {
  readonly title: string;
  readonly content: string;
  readonly previous?: Feed;
}

export interface Feed {
  readonly count: number;
  readonly latest?: Post
}

export class FeedStore {
  async fetchFeed(address: string): Promise<Feed> {
    const result = await send([
      script`
      import Procope from 0xProfile

      pub fun main(address: Address): Procope.ReadOnlyPostStore? {
        return Procope.read(address: address)
      }
      `,
      args([arg(address, Address)]),
    ]);
    return await decode(result);
  }
}