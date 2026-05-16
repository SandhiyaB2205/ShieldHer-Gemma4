const key = 'AIzaSyDlNb9NIlQznKGmSEDA9hwQKfd6qAREVFA';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function run() {
  const res = await fetch(url);
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
run();
