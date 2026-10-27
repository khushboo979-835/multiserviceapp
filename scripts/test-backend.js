const endpoints = [
  'https://multiserviceapp-4pdw.onrender.com/health',
  'https://multiserviceapp-4pdw.onrender.com/api/health',
  'https://multiserviceapp-4pdw.onrender.com/api/categories',
  'https://multiserviceapp-4pdw.onrender.com/api/products'
];

async function testAll() {
  for (const url of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(`[STATUS ${res.status}] in ${Date.now() - start}ms: ${url}`);
      console.log(`   Sample: ${text.slice(0, 100)}`);
    } catch (e) {
      console.log(`[ERROR] in ${Date.now() - start}ms: ${url} -> ${e.message}`);
    }
  }
}
testAll();
