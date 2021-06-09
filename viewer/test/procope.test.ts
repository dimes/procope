import {
  Address,
  Int,
  String,
  UInt64,
} from '@onflow/types';
import {
  deployContractByName,
  emulator,
  executeScript,
  getAccountAddress,
  init,
  sendTransaction,
} from 'flow-js-testing';
import path from 'path';
import { FeedPage, Post } from '../src/stores/feed';

const port = 8081;

beforeAll(async () => {
  await init(path.resolve(__dirname, '..', '..'), port);
});

beforeEach(async () => {
  await emulator.start(port, false);

  const alice = await getAccountAddress('Alice');
  await deployContractByName({ to: alice, name: 'Procope' });
});

afterEach(async () => {
  await emulator.stop();
});

describe('test procope', () => {
  const existsCode = (contractAcct: string) => `
    import Procope from ${contractAcct}

    pub fun main(address: Address): Bool {
      return Procope.exists(address: address)
    }`;

  const initTransaction = (contractAcct: string) => `
    import Procope from ${contractAcct}

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
    }`;

  const addPost = (contractAcct: string) => `
    import Procope from ${contractAcct}

    transaction(
      title: String,
      content: String,
      date: UInt64,
    ) {
      prepare(signer: AuthAccount) {
        if let postStore <- signer.load<@Procope.PostStore>(from: /storage/Posts) {
          postStore.addPost(title: title, content: content, date: date)
          signer.save(<-postStore, to: /storage/Posts)
        } else {
          panic("No previous post store to add post to")
        }
      }
    }`;

  const readPage = (contractAcct: string) => `
    import Procope from ${contractAcct}

    pub fun main(address: Address, page: Int): Procope.ReadOnlyPostStore? {
      return Procope.read(address: address, page: page)
    }`;

  const readSingle = (contractAcct: string) => `
    import Procope from ${contractAcct}

    pub fun main(address: Address, index: Int): Procope.ReadOnlyPost? {
      return Procope.readSinglePost(address: address, index: index)
    }`;

  const setupTestAccount = async (
    contractAcct: string,
    acct: string,
    now: number,
  ) => {
    await sendTransaction({
      code: initTransaction(contractAcct),
      signers: [acct]
    });

    for (let i = 0; i < 20; i++) {
      await sendTransaction({
        code: addPost(contractAcct),
        args: [
          [`Title ${i}`, String],
          [`Content ${i}`, String],
          [now - (i * 60 * 1000), UInt64],
        ],
        signers: [acct],
      });
    }
  }

  test('feed init', async () => {
    const alice = await getAccountAddress('Alice');
    const bob = await getAccountAddress('Bob');

    const existsBefore = await executeScript({
      code: existsCode(alice),
      args: [
        [bob, Address]
      ]
    });
    expect(existsBefore).toBe(false);

    await sendTransaction({
      code: initTransaction(alice),
      signers: [bob]
    });

    const existsAfter = await executeScript({
      code: existsCode(alice),
      args: [
        [bob, Address]
      ]
    });
    expect(existsAfter).toBe(true);
  });

  test('feed init - already exists', async () => {
    const alice = await getAccountAddress('Alice');
    const bob = await getAccountAddress('Bob');

    await sendTransaction({
      code: initTransaction(alice),
      signers: [bob]
    });

    const existsAfter = await executeScript({
      code: existsCode(alice),
      args: [
        [bob, Address]
      ]
    });
    expect(existsAfter).toBe(true);

    try {
      await sendTransaction({
        code: initTransaction(alice),
        signers: [bob]
      });
      fail();
    } catch (e) {
      expect(`${e}`).toContain('Post store already exists');
    }
  });

  test('read', async () => {
    const alice = await getAccountAddress('Alice');
    const bob = await getAccountAddress('Bob');
    const now = Date.now();

    await setupTestAccount(alice, bob, now);

    const page0: FeedPage = await executeScript({
      code: readPage(alice),
      args: [
        [bob, Address],
        [0, Int],
      ],
    });

    expect(page0.totalCount).toBe(20);
    for (let i = 0; i < page0.posts.length; i++) {
      const post = page0.posts[i];

      const expectedIndex = page0.totalCount - page0.posts.length + i;
      const expected: Post = {
        index: expectedIndex,
        title: `Title ${expectedIndex}`,
        content: `Content ${expectedIndex}`,
        date: now - (expectedIndex * 60 * 1000),
      };
      expect(post).toEqual(expected);
    }

    const page1: FeedPage = await executeScript({
      code: readPage(alice),
      args: [
        [bob, Address],
        [1, Int],
      ],
    });

    expect(page1.totalCount).toBe(20);
    for (let i = 0; i < page1.posts.length; i++) {
      const post = page1.posts[i];

      const expectedIndex = i;
      const expected: Post = {
        index: expectedIndex,
        title: `Title ${expectedIndex}`,
        content: `Content ${expectedIndex}`,
        date: now - (expectedIndex * 60 * 1000),
      };
      expect(post).toEqual(expected);
    }

    const page2: FeedPage = await executeScript({
      code: readPage(alice),
      args: [
        [bob, Address],
        [2, Int],
      ],
    });
    expect(page2.totalCount).toBe(20);
    expect(page2.posts.length).toBe(0);
  }, 60 * 1000);

  test('read single', async () => {
    const alice = await getAccountAddress('Alice');
    const bob = await getAccountAddress('Bob');
    const now = Date.now();

    await setupTestAccount(alice, bob, now);
    const index = 5;
    const post = await executeScript({
      code: readSingle(alice),
      args: [
        [bob, Address],
        [index, Int],
      ],
    });

    const expected: Post = {
      index: index,
      title: `Title ${index}`,
      content: `Content ${index}`,
      date: now - (index * 60 * 1000),
    };
    expect(post).toEqual(expected);
  }, 60 * 1000);
});
