const fs = require('fs');
const url = 'https://fwjfquiklvcveflqdken.supabase.co/rest/v1/';
const key = 'sb_publishable_Ox2fe4PkcBGqevWX91vqeA_Xxsc8O2V';

async function fetchSchema() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await res.text();
    fs.writeFileSync('schema.json', data);
    console.log("Schema saved to schema.json");
  } catch(e) {
    console.error(e);
  }
}
fetchSchema();
