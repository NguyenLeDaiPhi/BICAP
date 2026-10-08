import assert from 'node:assert/strict';
import fs from 'node:fs';

// Sample data requested for this local farm. No credentials are stored in the report.
const base = process.env.SEED_API_URL || 'http://localhost:8000';
const email = 'farmmanager@gmail.com';
const password = process.env.SEED_FARM_PASSWORD;
assert(password, 'Set SEED_FARM_PASSWORD before running.');
let token;
async function request(path, body) {
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  assert(response.ok, `${path}: HTTP ${response.status}: ${raw.slice(0, 250)}`);
  try { return JSON.parse(raw); } catch { return raw; }
}

token = await request('/api/auth/login', { email, password, clientId: 'farm' });
const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
assert.equal(claims.email, email);
assert.equal(Number(claims.userId), 4);
assert(String(claims.roles).includes('ROLE_FARMMANAGER'));
const batches = await request('/api/production-batches');
const products = await request('/api/products/my');
assert(batches.length > 0, 'An existing owned farm is required.');
const farm = batches[0].farm;
assert.equal(farm.ownerId, Number(claims.userId));
assert.equal(farm.email, email);
assert(batches.every(batch => batch.farm.id === farm.id));
assert(products.every(product => product.farmId === farm.id));

const rows = [
  ['Đậu xanh', 'Đậu các loại', 45000, 300, 0.20, '2026-12-17', 'Hạt đậu xanh dùng nấu chè, cháo hoặc làm bánh.'],
  ['Đậu đen', 'Đậu các loại', 48000, 250, 0.20, '2026-12-22', 'Hạt đậu đen dùng nấu chè, xôi hoặc chế biến đồ uống.'],
  ['Đậu đỏ', 'Đậu các loại', 55000, 200, 0.15, '2026-12-27', 'Hạt đậu đỏ dùng nấu chè và làm nhân bánh.'],
  ['Đậu nành', 'Đậu các loại', 35000, 400, 0.25, '2027-01-06', 'Hạt đậu nành dùng làm sữa đậu nành và đậu phụ.'],
  ['Đậu cô ve', 'Đậu các loại', 30000, 350, 0.10, '2026-12-02', 'Quả đậu cô ve dùng luộc, xào hoặc nấu canh.'],
  ['Rau muống', 'Rau xanh', 15000, 500, 0.10, '2026-11-07', 'Rau muống dùng luộc, xào hoặc nấu canh.'],
  ['Cải ngọt', 'Rau xanh', 22000, 400, 0.08, '2026-11-12', 'Cải ngọt dùng xào, luộc hoặc nấu canh.'],
  ['Cải thìa', 'Rau xanh', 25000, 350, 0.08, '2026-11-17', 'Cải thìa dùng xào nấm, luộc hoặc nấu mì.'],
  ['Xà lách', 'Rau xanh', 30000, 250, 0.06, '2026-11-22', 'Xà lách dùng làm salad và các món cuốn.'],
  ['Mồng tơi', 'Rau xanh', 18000, 300, 0.07, '2026-11-12', 'Mồng tơi dùng nấu canh và các món rau luộc.'],
];
const folder = 'reports/farm-vegetables-2026-10-08';
fs.mkdirSync(folder, { recursive: true });
const beforePath = `${folder}/before.json`;
if (!fs.existsSync(beforePath)) fs.writeFileSync(beforePath, JSON.stringify({ farm, batches, products }, null, 2));
const resultPath = `${folder}/result.json`;
const report = { email, farmId: farm.id, ownerId: farm.ownerId, sampleData: true, items: [] };
const saveReport = () => fs.writeFileSync(resultPath, JSON.stringify(report, null, 2));

for (const [name, category, price, quantity, area, endDate, description] of rows) {
  const seasonName = `Vụ ${name.toLocaleLowerCase('vi-VN')} tháng 10/2026`;
  const matches = batches.filter(batch => batch.name === seasonName && batch.productType === name);
  assert(matches.length <= 1, `Ambiguous existing season: ${seasonName}`);
  let batch = matches[0];
  if (!batch) {
    batch = await request('/api/production-batches', {
      farmId: farm.id, name: seasonName, productType: name,
      startDate: '2026-10-08', endDate, area, quantity: quantity / 1000, status: 'PLANNING',
    });
    assert.equal(batch.farm.id, farm.id);
    batches.push(batch);
  }
  const item = { name, batchId: batch.id, batchCode: batch.batchCode };
  report.items.push(item);
  saveReport();
  const linked = products.filter(product => product.batchId === batch.id);
  assert(linked.length <= 1, `Multiple products linked to season ${batch.id}`);
  let product = linked[0];
  if (!product) {
    product = await request('/api/products', {
      farmId: farm.id, productionBatchId: batch.id, name, category,
      price, quantity, unit: 'kg', description,
    });
    assert.equal(product.farm.id, farm.id);
    assert.equal(product.productionBatch.id, batch.id);
    products.push({ ...product, batchId: batch.id, farmId: farm.id });
  }
  assert.equal(product.name, name);
  Object.assign(item, { productId: product.id, price, quantity, unit: 'kg', status: product.status });
  saveReport();
  console.log(JSON.stringify(item));
}

const finalProducts = await request('/api/products/my');
const finalBatches = await request('/api/production-batches');
for (const item of report.items) {
  const product = finalProducts.find(p => p.id === item.productId);
  const batch = finalBatches.find(b => b.id === item.batchId);
  assert(product && batch);
  assert.equal(product.farmId, farm.id);
  assert.equal(batch.farm.ownerId, farm.ownerId);
  assert.equal(product.batchId, batch.id);
  assert.equal(product.name, item.name);
  assert.equal(product.quantity, item.quantity);
  assert.equal(Number(product.price), item.price);
  item.status = product.status;
  item.seasonStatus = batch.status;
}
const before = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
for (const product of before.products) assert.deepEqual(finalProducts.find(p => p.id === product.id), product);
for (const batch of before.batches) assert.deepEqual(finalBatches.find(b => b.id === batch.id), batch);
report.verifiedAt = new Date().toISOString();
report.totalProducts = finalProducts.length;
report.totalSeasons = finalBatches.length;
report.existingRecordsUnchanged = true;
saveReport();
console.log(JSON.stringify({ verified: true, items: report.items.length, totalProducts: report.totalProducts, totalSeasons: report.totalSeasons }));
