import { supabase } from '../../../../lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const nome = searchParams.get('nome') || ''

  if (!nome) return Response.json({ error: 'Nome obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('decisoes_pmba')
    .select('*')
    .ilike('relator', `%${nome}%`)
    .order('data_julgamento', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Estatísticas do magistrado
  const total = data.length
  let favoravel = 0
  const temasMap = {}
  const anosMap = {}

  for (const d of data) {
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) favoravel++

    const tema = d.tema || 'N/D'
    if (!temasMap[tema]) temasMap[tema] = { total: 0, favoravel: 0 }
    temasMap[tema].total++
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) temasMap[tema].favoravel++

    const ano = d.data_julgamento ? d.data_julgamento.substring(0, 4) : 'N/D'
    if (!anosMap[ano]) anosMap[ano] = { total: 0, favoravel: 0 }
    anosMap[ano].total++
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) anosMap[ano].favoravel++
  }

  const temas = Object.entries(temasMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([tema, v]) => ({ tema, ...v, pct: v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : 0 }))

  const anos = Object.entries(anosMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([ano, v]) => ({ ano, ...v, pct: v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : 0 }))

  return Response.json({
    relator: data[0]?.relator || nome,
    total,
    favoravel,
    pct: total > 0 ? ((favoravel / total) * 100).toFixed(1) : 0,
    temas,
    anos,
    recentes: data.slice(0, 10)
  })
}
