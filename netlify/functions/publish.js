// Netlify Function: publish.js
// Accepts config JSON, commits it to GitHub, triggers redeploy
const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO || 'runloai/Primesign2';
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

  if (!GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GITHUB_TOKEN not configured' }) };
  }

  try {
    const config = JSON.parse(event.body);
    const configJson = JSON.stringify({
      contact: config.contact,
      testimonials: config.testimonials,
      services: config.services,
      portfolio: config.portfolio,
      hero: config.hero,
      aboutImages: config.aboutImages,
      advantageImages: config.advantageImages,
      colorScheme: config.colorScheme,
      serviceCategories: config.serviceCategories,
      settings: config.settings,
      _publishedAt: new Date().toISOString(),
      _version: '1.0'
    }, null, 2);

    // Get current file SHA
    const sha = await getFileSha(GITHUB_TOKEN, GITHUB_REPO, 'public/config.json', GITHUB_BRANCH);

    // Commit new config
    const commitResult = await commitFile(GITHUB_TOKEN, GITHUB_REPO, 'public/config.json', configJson, sha, GITHUB_BRANCH);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        ok: true, 
        services: config.services?.length || 0,
        message: 'Published! Site will update in ~30 seconds.',
        commit: commitResult.sha
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

function githubApi(path, token, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Primesign-Admin',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getFileSha(token, repo, filePath, branch) {
  try {
    const result = await githubApi(`/repos/${repo}/contents/${filePath}?ref=${branch}`, token);
    return result.sha;
  } catch (e) {
    return null; // File doesn't exist yet
  }
}

async function commitFile(token, repo, filePath, content, sha, branch) {
  const body = {
    message: '📦 Admin: publish config.json',
    content: Buffer.from(content).toString('base64'),
    branch: branch
  };
  if (sha) body.sha = sha;

  return githubApi(`/repos/${repo}/contents/${filePath}`, token, 'PUT', body);
}
