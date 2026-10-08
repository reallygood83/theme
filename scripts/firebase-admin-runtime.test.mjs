import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('Firebase Admin Auth loads when CommonJS cannot require ES modules', () => {
  const result = spawnSync(process.execPath, [
    '--no-experimental-require-module',
    '-e',
    "require('firebase-admin/auth')",
  ], { encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
})

test('JWKS signing keys remain usable with the compatible jose release', () => {
  const result = spawnSync(process.execPath, [
    '--no-experimental-require-module',
    '-e',
    `const { generateKeyPairSync } = require('node:crypto');
     const { retrieveSigningKeys } = require('jwks-rsa/src/utils');
     const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
     retrieveSigningKeys([{ ...publicKey.export({ format: 'jwk' }), kid: 'test', use: 'sig' }])
       .then(keys => { if (keys.length !== 1 || !keys[0].getPublicKey().includes('BEGIN PUBLIC KEY')) process.exitCode = 1 })
       .catch(error => { console.error(error); process.exitCode = 1 });`,
  ], { encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
})
