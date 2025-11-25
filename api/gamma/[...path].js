export default async function handler(req, res) {
  const { path } = req.query
  const pathStr = Array.isArray(path) ? path.join('/') : path
  const url = `https://gamma-api.polymarket.com/${pathStr}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
