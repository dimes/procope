import {
  arg,
  args,
  authorizations,
  authz,
  decode,
  limit,
  payer,
  proposer,
  send,
  script,
  transaction,
  tx,
} from '@onflow/fcl';
import {
  Address,
  String,
} from '@onflow/types';
import { from, Observable } from 'rxjs';

export interface Post {
  readonly index: number;
  readonly title: string;
  readonly content: string;
}

export interface FeedPage {
  readonly totalCount: number;
  readonly posts: Post[];
}

export class FeedStore {
  exists(address: string): Observable<boolean> {
    return from(
      send([
        script`
      import Procope from 0xProfile

      pub fun main(address: Address): Bool {
        return Procope.exists(address: address)
      }
      `,
        args([arg(address, Address)]),
      ]).then(res => decode<boolean>(res))
    );
  }

  fetchFeed(address: string): Observable<FeedPage | null> {
    return from(
      send([
        script`
        import Procope from 0xProfile

        pub fun main(address: Address): Procope.ReadOnlyPostStore? {
          return Procope.read(address: address, page: 0)
        }`,
        args([arg(address, Address)]),
      ]).then(res => decode<FeedPage>(res))
    );
  }

  async initFeed(): Promise<void> {
    const res = await send([
      transaction`
      import Procope from 0x01cf0e2f2f715450

      transaction {
        prepare(signer: AuthAccount) {
          if let postStore <- signer.load<@Procope.PostStore>(from: /storage/Posts) {
            signer.save(<-postStore, to: /storage/Posts)
            panic("Post store already exists")
          }
      
          let postStore <- Procope.createPostStore()
          signer.save(<-postStore, to: /storage/Posts)
      
          signer.link<&Procope.PostStore{Procope.HasPosts}>(/public/Feed, target: /storage/Posts)
        }
      }`,
      payer(authz),
      proposer(authz),
      authorizations([authz]),
      limit(35),
    ]);
    const txId = await decode<string>(res);
    await tx(txId).onceSealed();
  }

  async createPost(title: string, content: string): Promise<void> {
    const res = await send([
      transaction`
      import Procope from 0x01cf0e2f2f715450

      transaction(
        title: String,
        content: String,
      ) {
        prepare(signer: AuthAccount) {
          if let postStore <- signer.load<@Procope.PostStore>(from: /storage/Posts) {
            postStore.addPost(title: title, content: content)
            signer.save(<-postStore, to: /storage/Posts)
          } else {
            panic("No previous post store to add post to")
          }
        }
      }
      `,
      payer(authz),
      proposer(authz),
      authorizations([authz]),
      limit(35),
      args([arg(title, String), arg(content, String)]),
    ]);

    const txId = await decode<string>(res);
    await tx(txId).onceSealed();
  }
}