import { supabase } from '../../../lib/supabase'

const KEYWORDS = {
  promocao: ['promoção', 'carreira', 'merecimento', 'antiguidade', 'acesso'],
  gratificacao: ['gratificação', 'incorporação', 'vantagem', 'adicional', 'GAMA', 'GAPM'],
  saude: ['saúde', 'afastamento', 'tratamento médico', 'licença médica', 'invalidez', 'incapacidade'],
  disciplinar: ['disciplinar', 'sindicância', 'punição', 'suspensão', 'exclusão', 'expulsão'],
  pensao: ['pensão', 'pensionista', 'dependente'],
  reforma: ['reforma', 'reserva', 'aposentadoria', 'inatividade'],
  concurso: ['concurso', 'nomeação', 'aprovado', 'edital'],
  soldo: ['soldo', 'remuneração', 'vencimento'],
  qoapm: ['QOAPM', 'auxiliar', 'quadro de oficiais'],
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tema = searchParams.get('tema') || ''

  const keywords = KEYWORDS[tema.toLowerCase()] || [tema]
  const orCondition = keywords.map(k => `ementa.ilike.%${k}%`).join(',')

  const { data, error } = await supabase
    .from('decisoes_pmba')
    .select('id, numero_processo, ementa, relator, data_julgamento, resultado, resultado_class, tema, subtema, url_origem')
    .or(orCondition)
    .order('data_julgamento', { ascending: false })
    .limit(500)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  let favoravel = 0
  const relatoresMap = {}
  const fav = (d) => d.resultado_class && /concedi|provid|favorav|deferido/i.test(d.resultado_class)

  for (const d of (data || [])) {
    if (fav(d)) favoravel++
    const rel = d.relator || 'N/D'
    if (!relatoresMap[rel]) relatoresMap[rel] = { total: 0, favoravel: 0 }
    relatoresMap[rel].total++
    if (fav(d)) relatoresMap[rel].favoravel++
  }

  const relatores = Object.entries(relatoresMap).sort((a,b) => b[1].total - a[1].total)
    .map(([relator, v]) => ({ relator, ...v, pct: v.total > 0 ? ((v.favoravel/v.total)*100).toFixed(1) : '0.0' }))

  return Response.json({ tema, total: data?.length || 0, favoravel, pct: data?.length > 0 ? ((favoravel/data.length)*100).toFixed(1) : '0.0', relatores, decisoes: data?.slice(0, 50) })
}
