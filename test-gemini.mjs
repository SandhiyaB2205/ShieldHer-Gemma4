const key = 'AIzaSyDlNb9NIlQznKGmSEDA9hwQKfd6qAREVFA';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

async function run() {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
run();
