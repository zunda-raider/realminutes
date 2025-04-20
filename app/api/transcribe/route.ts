export async function POST(req: Request) {
    const body = await req.json()
  
    const res = await fetch('http://localhost:8000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: body.url,
        language: body.language || 'ja'
      })
    })
  
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  