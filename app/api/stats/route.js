import { supabase } from '../../../lib/supabase'

export async function GET() {
  // Total de decisões
  const { count: total } = await supabase
    .from('decisoes_pmba')
    .select('*', { count: 'exact', head: true })

  // Por ano
  const { data: porAno } = await supabase
    .from('decisoes_pmba')
    .select('data_julgamento, resultado')

  // Por relator
  const { data: porRelator } = await supabase
    .from('decisoes_pmba')
    .select('relator, resultado')

  // Por tema
  const { data: porTema } = await supabase
    .from('decisoes_pmba')
    .select('tema, resultado')

  // Processar estatísticas
  const anosMap = {}
  const relatoresMap = {}
  const temasMap = {}

  for (const d of (porAno || [])) {
    const ano = d.data_julgamento ? d.data_julgamento.substring(0, 4) : 'N/D'
    if (!anosMap[ano]) anosMap[ano] = { total: 0, favoravel: 0 }
    anosMap[ano].total++
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) anosMap[ano].favoravel++
  }

  for (const d of (porRelator || [])) {
    const rel = d.relator || 'N/D'
    if (!relatoresMap[rel]) relatoresMap[rel] = { total: 0, favoravel: 0 }
    relatoresMap[rel].total++
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) relatoresMap[rel].favoravel++
  }

  for (const d of (porTema || [])) {
    const tema = d.tema || 'N/D'
    if (!temasMap[tema]) temasMap[tema] = { total: 0, favoravel: 0 }
    temasMap[tema].total++
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) temasMap[tema].favoravel++
  }

  const anos = Object.entries(anosMap).sort((a, b) => a[0].localeCompare(b[0])).map(([ano, v]) => ({
    ano, ...v, pct: v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : 0
  }))

  const relatores = Object.entries(relatoresMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 30)
    .map(([relator, v]) => ({
      relator, ...v, pct: v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : 0
    }))

  const temas = Object.entries(temasMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20)
    .map(([tema, v]) => ({
      tema, ...v, pct: v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : 0
    }))

  return Response.json({ total, anos, relatores, temas })
}
