import { config as fclConfig } from '@onflow/fcl';

export function init() {
  fclConfig()
    .put('accessNode.api', 'http://localhost:8080')
    .put('challenge.handshake', 'http://localhost:3000/fcl/authn')
    .put('0xProfile', '0x01cf0e2f2f715450');
}