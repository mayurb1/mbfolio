/* eslint-env node */
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const formspreeId = process.env.FORMSPREE_ID
    if (!formspreeId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Form endpoint not configured' }),
      }
    }

    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: event.body || '{}',
    })

    const text = await response.text()
    return { statusCode: response.status, body: text }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Upstream error' }),
    }
  }
}
