import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .storage
    .from('minutes') // ←あなたのバケット名
    .list('', { limit: 100 })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/minutes`
  const files = data?.map(file => ({
    name: file.name,
    url: `${baseUrl}/${file.name}`
  }))

  return new Response(JSON.stringify(files), {
    headers: { 'Content-Type': 'application/json' }
  })
}
