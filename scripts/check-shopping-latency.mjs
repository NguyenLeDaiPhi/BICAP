import assert from 'node:assert/strict';
import fs from 'node:fs';

// Uses the published bean products in the local catalog; never changes data.
const base = process.env.AUDIT_API_URL || 'http://localhost:8000';
const budgetRequest = 'Tôi cần 2 kg đậu xanh, tổng ngân sách tối đa 100 nghìn';
const cases = [
  { message: 'đậu', check: data => {
    assert(data.products.length > 0);
    assert(data.filters.keywords.some(word => word.includes('đậu')));
    assert.equal(data.filters.excludedKeywords.length, 0);
    assert.equal(data.filters.unsupportedRequirements.length, 0);
  } },
  { message: 'Tìm đậu xanh dưới 50 nghìn/kg', check: data => {
    assert(data.products.some(p => p.name === 'Đậu xanh'));
    assert.equal(data.filters.maxUnitPrice, 50000);
    assert.equal(data.filters.excludedKeywords.length, 0);
    assert.equal(data.filters.unsupportedRequirements.length, 0);
    assert(data.products.every(p => p.price <= 50000));
  } },
  { message: budgetRequest, check: data => {
    assert.equal(data.filters.quantity, 2);
    assert.equal(data.filters.maxTotalPrice, 100000);
    assert(data.products.some(p => p.name === 'Đậu xanh'));
    assert(data.products.every(p => p.price * 2 <= 100000));
  } },
  { message: 'Chỉ còn 50 nghìn thôi', history: [{ role: 'user', content: budgetRequest }], check: data => {
    assert.equal(data.filters.quantity, 2);
    assert.equal(data.filters.maxTotalPrice, 50000);
    assert(data.products.every(p => p.price * 2 <= 50000));
  } },
  { message: 'Tìm đậu, không lấy đậu đen', check: data => {
    assert(data.products.some(p => p.name === 'Đậu xanh'));
    assert(data.products.every(p => !p.name.includes('Đậu đen')));
    assert(data.filters.excludedKeywords.some(word => word.includes('đen')));
  } },
  { message: 'Tìm đậu xanh có chứng nhận hữu cơ', check: data => {
    assert.equal(data.products.length, 0);
    assert(data.filters.unsupportedRequirements.length > 0);
  } },
];
const results = [];
for (const item of cases) {
  const started = Date.now();
  try {
    const response = await fetch(base + '/api/assistant/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3010' },
      body: JSON.stringify({ message: item.message, history: item.history || [] }),
      signal: AbortSignal.timeout(55000),
    });
    const data = await response.json();
    assert.equal(response.status, 200, JSON.stringify(data));
    assert(['*', 'http://localhost:3010'].includes(response.headers.get('access-control-allow-origin')));
    assert(data.products.every(p => p.status === 'APPROVED' && p.quantity > 0));
    item.check(data);
    results.push({ message: item.message, passed: true, milliseconds: Date.now() - started, filters: data.filters,
      products: data.products.map(p => ({ id: p.id, name: p.name, price: p.price })), reply: data.reply });
  } catch (error) {
    results.push({ message: item.message, passed: false, milliseconds: Date.now() - started, error: error.message });
  }
  console.log(JSON.stringify(results.at(-1)));
}
fs.mkdirSync('reports/ai-latency-2026-10-08', { recursive: true });
fs.writeFileSync('reports/ai-latency-2026-10-08/live-checks.json', JSON.stringify(results, null, 2));
if (results.some(result => !result.passed)) process.exitCode = 1;
