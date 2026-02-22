import { supabase } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const nome = searchParams.get('nome') || ''
  if (!nome) return Response.json({ error: 'Nome obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('decisoes_pmba')
    .select('id, numero_processo, ementa, relator, data_julgamento, resultado, resultado_class, tema, subtema, url_origem')
    .ilike('relator', `%${nome}%`)
    .order('data_julgamento', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const total = data.length
  let favoravel = 0
  const temasMap = {}, anosMap = {}
  const fav = (d) => d.resultado_class && /concedi|provid|favorav|deferido/i.test(d.resultado_class)

  for (const d of data) {
    if (fav(d)) favoravel++
    const tema = d.tema || 'N/D'
    if (!temasMap[tema]) temasMap[tema] = { total: 0, favoravel: 0 }
    temasMap[tema].total++
    if (fav(d)) temasMap[tema].favoravel++
    const ano = d.data_julgamento ? d.data_julgamento.substring(0, 4) : 'N/D'
    if (!anosMap[ano]) anosMap[ano] = { total: 0, favoravel: 0 }
    anosMap[ano].total++
    if (fav(d)) anosMap[ano].favoravel++
  }

  const pct = (v) => v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : '0.0'

  return Response.json({
    relator: data[0]?.relator || nome,
    total,
    favoravel,
    pct: total > 0 ? ((favoravel / total) * 100).toFixed(1) : '0.0',
    temas: Object.entries(temasMap).sort((a,b) => b[1].total - a[1].total).map(([tema, v]) => ({ tema, ...v, pct: pct(v) })),
    anos: Object.entries(anosMap).sort((a,b) => a[0].localeCompare(b[0])).map(([ano, v]) => ({ ano, ...v, pct: pct(v) })),
    recentes: data.slice(0, 10)
  })
}
