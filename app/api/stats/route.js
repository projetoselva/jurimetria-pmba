import { supabase } from '../../../lib/supabase'

export async function GET() {
  const { count: total } = await supabase
    .from('decisoes_pmba')
    .select('*', { count: 'exact', head: true })

  const { data: todos } = await supabase
    .from('decisoes_pmba')
    .select('relator, resultado_class, tema, data_julgamento')

  const anosMap = {}, relatoresMap = {}, temasMap = {}

  for (const d of (todos || [])) {
    const ano = d.data_julgamento ? d.data_julgamento.substring(0, 4) : 'N/D'
    const fav = d.resultado_class && /concedi|provid|favorav|deferido/i.test(d.resultado_class)

    if (!anosMap[ano]) anosMap[ano] = { total: 0, favoravel: 0 }
    anosMap[ano].total++
    if (fav) anosMap[ano].favoravel++

    const rel = d.relator || 'N/D'
    if (!relatoresMap[rel]) relatoresMap[rel] = { total: 0, favoravel: 0 }
    relatoresMap[rel].total++
    if (fav) relatoresMap[rel].favoravel++

    const tema = d.tema || 'N/D'
    if (!temasMap[tema]) temasMap[tema] = { total: 0, favoravel: 0 }
    temasMap[tema].total++
    if (fav) temasMap[tema].favoravel++
  }

  const pct = (v) => v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : '0.0'

  const anos = Object.entries(anosMap).sort((a,b) => a[0].localeCompare(b[0]))
    .map(([ano, v]) => ({ ano, ...v, pct: pct(v) }))

  const relatores = Object.entries(relatoresMap).sort((a,b) => b[1].total - a[1].total).slice(0, 30)
    .map(([relator, v]) => ({ relator, ...v, pct: pct(v) }))

  const temas = Object.entries(temasMap).sort((a,b) => b[1].total - a[1].total).slice(0, 20)
    .map(([tema, v]) => ({ tema, ...v, pct: pct(v) }))

  return Response.json({ total, anos, relatores, temas })
}
