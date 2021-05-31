import { arg, args, decode, send, script } from '@onflow/fcl';
import { Address } from '@onflow/types';
import { from, Observable } from 'rxjs';

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
  exists(address: string): Observable<boolean> {
    return from(
      send([
        script`
      import Procope from 0xProfile

      pub fun main(address: Address): Procope.ReadOnlyPostStore? {
        return Procope.exists(address: address)
      }
      `,
        args([arg(address, Address)]),
      ]).then(res => decode<boolean>(res))
    );
  }

  fetchFeed(address: string): Observable<Feed | null> {
    return from(
      send([
        script`
      import Procope from 0xProfile

      pub fun main(address: Address): Procope.ReadOnlyPostStore? {
        return Procope.read(address: address)
      }
      `,
        args([arg(address, Address)]),
      ]).then(res => decode<Feed>(res))
    );
  }
}