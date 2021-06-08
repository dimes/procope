import { getAccountAddress, init } from 'flow-js-testing';
import path from 'path';

beforeAll(async () => {
  console.log('Starting');
  await init(path.resolve(__dirname, '..', 'contracts'));
  console.log('Done');
});

describe('test procope', () => {
  test('Create Accounts', async () => {
    console.log('Test');
    const Alice = await getAccountAddress('Alice');
    const Bob = await getAccountAddress('Bob');
    const Charlie = await getAccountAddress('Charlie');
    const Dave = await getAccountAddress('Dave');

    console.log('Four accounts were created with following addresses:\n', {
      Alice,
      Bob,
      Charlie,
      Dave,
    });
  });
});
