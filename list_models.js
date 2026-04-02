const fs = require('fs');

const envContent = fs.readFileSync(".env.local", "utf8");
let apiKey = "";
envContent.split('\n').forEach(line => {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
    if (apiKey.startsWith('"') && apiKey.endsWith('"')) { apiKey = apiKey.slice(1, -1); }
  }
});

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    let text = "";
    if (data && data.models) {
      data.models.forEach(model => {
        text += model.name + "\n";
      });
    } else {
        text = JSON.stringify(data);
    }
    fs.writeFileSync("models.txt", text);
  } catch (error) {
    console.error(error);
  }
}

listModels();
