import { supabase } from '../../../lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const relator = searchParams.get('relator') || ''
  const tema = searchParams.get('tema') || ''
  const ano = searchParams.get('ano') || ''
  const resultado = searchParams.get('resultado') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('decisoes_pmba')
    .select('*', { count: 'exact' })

  if (q) {
    query = query.or(`ementa.ilike.%${q}%,numero_processo.ilike.%${q}%`)
  }
  if (relator) {
    query = query.ilike('relator', `%${relator}%`)
  }
  if (tema) {
    query = query.ilike('tema', `%${tema}%`)
  }
  if (ano) {
    query = query.ilike('data_julgamento', `${ano}%`)
  }
  if (resultado) {
    query = query.ilike('resultado', `%${resultado}%`)
  }

  query = query.order('data_julgamento', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ data, count, page, pages: Math.ceil(count / limit) })
}
