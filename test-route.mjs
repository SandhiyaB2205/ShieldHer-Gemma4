

async function testRoute() {
  try {
    const res = await fetch('http://localhost:3000/api/gemini-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: "Chennai Central",
        destination: "Anna Nagar",
        originLat: 13.0827,
        originLng: 80.2707,
        destLat: 13.0850,
        destLng: 80.2101
      })
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testRoute();
