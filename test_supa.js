const url = 'https://fwjfquiklvcveflqdken.supabase.co/rest/v1';
const key = 'sb_publishable_Ox2fe4PkcBGqevWX91vqeA_Xxsc8O2V';

async function test() {
  try {
    const res1 = await fetch(`${url}/confessions`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ this_column_does_not_exist: 1 })
    });
    const data1 = await res1.text();
    console.log("Confessions Error Info:", data1);

    const res2 = await fetch(`${url}/reactions`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ this_column_does_not_exist: 1 })
    });
    const data2 = await res2.text();
    console.log("Reactions Error Info:", data2);
  } catch(e) {
    console.error(e);
  }
}
test();
