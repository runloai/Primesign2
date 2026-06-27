// Netlify Function: Publish site config to GitHub
// This allows admin panel to persist changes server-side

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get environment variables
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'runloai';
  const repo = process.env.GITHUB_REPO || 'primesigntest';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const adminToken = process.env.ADMIN_PUBLISH_TOKEN;

  // Validate environment
  if (!token || !adminToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Server misconfiguration: missing GITHUB_TOKEN or ADMIN_PUBLISH_TOKEN' 
      }),
    };
  }

  // Validate admin token from header
  const providedToken = event.headers['x-admin-token'] || event.headers['x-admin-token'];
  if (providedToken !== adminToken) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  // Parse request body
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON payload' }),
    };
  }

  // Basic validation
  if (!payload || typeof payload !== 'object') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Empty or invalid payload' }),
    };
  }

  // Add metadata
  payload.meta = {
    version: '2.0',
    publishedAt: new Date().toISOString(),
  };

  const api = 'https://api.github.com';
  const fileUrl = api + '/repos/' + owner + '/' + repo + '/contents/public/config.json?ref=' + branch;

  try {
    // Get current file SHA
    const currentResp = await fetch(fileUrl, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
      },
    });

    let sha;
    if (currentResp.ok) {
      const current = await currentResp.json();
      sha = current.sha;
    } else if (currentResp.status !== 404) {
      // File might not exist yet, that's OK
      console.error('Failed to get current file:', currentResp.status);
    }

    // Prepare new content
    const content = Buffer.from(JSON.stringify(payload, null, 2) + '\n', 'utf8').toString('base64');

    // Commit to GitHub
    const updateResp = await fetch(api + '/repos/' + owner + '/' + repo + '/contents/public/config.json', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update site config - ' + new Date().toISOString(),
        content: content,
        sha: sha,
        branch: branch,
      }),
    });

    if (!updateResp.ok) {
      const errorText = await updateResp.text();
      console.error('GitHub update failed:', errorText);
      return {
        statusCode: updateResp.status,
        body: JSON.stringify({ 
          error: 'GitHub update failed', 
          detail: errorText 
        }),
      };
    }

    const result = await updateResp.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: 'Config published successfully',
        commit: result.commit ? result.commit.sha : null,
        services: Array.isArray(payload.services) ? payload.services.length : 0,
        categories: Array.isArray(payload.serviceCategories) ? payload.serviceCategories.length : 0,
      }),
    };
  } catch (error) {
    console.error('Publish error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
