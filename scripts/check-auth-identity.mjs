import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import cp from 'node:child_process';
import fs from 'node:fs';

const base = process.env.AUDIT_API_URL || 'http://localhost:8000';
const email = 'auth-check-' + crypto.randomUUID().replaceAll('-', '') + '@example.invalid';
const password = crypto.randomBytes(18).toString('base64url');
const results = [];
let fixtureId;
const createdIds = [];
async function request(path, body, headers = {}) {
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const raw = await response.text();
  let data; try { data = JSON.parse(raw); } catch { data = raw; }
  return { status: response.status, data };
}
async function check(name, callback) {
  try { await callback(); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, error: error.message }); throw error; }
}
try {
  await check('Concurrent retailer registrations create exactly one account', async () => {
    const responses = await Promise.all([0, 1].map(() => request('/api/auth/register', { email, password, role: 'RETAILER' })));
    for (const response of responses) if (response.status === 200 && Number.isSafeInteger(Number(response.data.id))) createdIds.push(Number(response.data.id));
    assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
    const response = responses.find(response => response.status === 200);
    assert.equal(response.status, 200);
    fixtureId = Number(response.data.id);
    assert(Number.isSafeInteger(fixtureId) && fixtureId > 0);
    assert.equal(response.data.email, email);
    assert(!Object.hasOwn(response.data, 'password'));
  });
  await check('Real login retains correct account ID and retailer role', async () => {
    const response = await request('/api/auth/login', { email, password, clientId: 'retailer' });
    assert.equal(response.status, 200);
    assert.equal(typeof response.data, 'string');
    const claims = JSON.parse(Buffer.from(response.data.split('.')[1], 'base64url').toString('utf8'));
    assert.equal(Number(claims.userId), fixtureId);
    assert(String(claims.roles).includes('ROLE_RETAILER'));
    const orders = await request('/api/orders/my', undefined, { Authorization: 'Bearer ' + response.data });
    assert.equal(orders.status, 200);
  });
  await check('Duplicate email with different casing returns 409', async () => {
    const response = await request('/api/auth/register', { email: ' ' + email.toUpperCase() + ' ', password, role: 'RETAILER' });
    assert.equal(response.status, 409);
  });
  await check('Incorrect password is rejected', async () => {
    const response = await request('/api/auth/login', { email, password: password + '-wrong', clientId: 'retailer' });
    assert([400, 401].includes(response.status));
  });
  await check('Retailer account cannot sign in as farm manager', async () => {
    const response = await request('/api/auth/login', { email, password, clientId: 'farm' });
    assert([400, 401].includes(response.status));
  });
} catch { process.exitCode = 1; }
finally {
  if (createdIds.length) {
    try {
      const cfg = JSON.parse(cp.execFileSync('docker', ['compose', 'config', '--format', 'json'], { encoding: 'utf8' }));
      const db = cfg.services['auth-db'].environment.MYSQL_DATABASE;
      // Only the UUID account created by this run is removed; existing accounts are untouched.
      const sql = `START TRANSACTION;
        DELETE ur FROM user_roles ur JOIN users u ON u.id=ur.user_id WHERE u.id IN (${createdIds.join(',')}) AND u.email='${email}';
        DELETE FROM users WHERE id IN (${createdIds.join(',')}) AND email='${email}';
        COMMIT; SELECT COUNT(*) FROM users WHERE id IN (${createdIds.join(',')}) AND email='${email}';`;
      const remaining = cp.execFileSync('docker', ['exec', '-i', 'auth-db', 'sh', '-c', 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot "$@"', 'sh', db, '-N', '-B', '--raw'], { input: sql, encoding: 'utf8' }).trim();
      assert.equal(remaining, '0'); results.push({ name: 'Only the temporary test account was cleaned up', passed: true });
    } catch (error) { results.push({ name: 'Temporary account cleanup', passed: false, error: error.message }); process.exitCode = 1; }
  }
  fs.mkdirSync('reports/auth-duplicate-repair', { recursive: true });
  fs.writeFileSync('reports/auth-duplicate-repair/live-checks.json', JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify(results, null, 2));
}
