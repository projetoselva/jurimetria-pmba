import { supabase } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'

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
    .select('id, numero_processo, ementa, relator, data_julgamento, resultado, resultado_class, classe_processual, tema, subtema, url_origem', { count: 'exact' })

  if (q) query = query.or(`ementa.ilike.%${q}%,numero_processo.ilike.%${q}%`)
  if (relator) query = query.ilike('relator', `%${relator}%`)
  if (tema) query = query.ilike('tema', `%${tema}%`)
  if (ano) query = query.gte('data_julgamento', `${ano}-01-01`).lte('data_julgamento', `${ano}-12-31`)
  if (resultado) query = query.ilike('resultado_class', `%${resultado}%`)

  query = query.order('data_julgamento', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data, count, page, pages: Math.ceil((count || 0) / limit) })
}
