const { XposedOrNot } = require('xposedornot');
const xon = new XposedOrNot();

async function test() {
  try {
    const email = 'zaidshaikh26166@gmail.com';
    
    console.log(`Checking checkEmail for ${email}...`);
    try {
      const res1 = await xon.checkEmail(email);
      console.log('checkEmail Result:', JSON.stringify(res1, null, 2));
    } catch (e) {
      console.log('checkEmail Error:', e.message);
    }

    console.log(`\nChecking getBreachAnalytics for ${email}...`);
    try {
      const res2 = await xon.getBreachAnalytics(email);
      console.log('getBreachAnalytics Result:', JSON.stringify(res2, null, 2));
    } catch (e) {
      console.log('getBreachAnalytics Error:', e.message);
    }
  } catch (e) {
    console.error(e);
  }
}

test();
