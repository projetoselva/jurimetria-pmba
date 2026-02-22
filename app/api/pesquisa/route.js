import { supabase } from '../../../lib/supabase'

const TEMAS = {
  'promocao': ['promoção', 'carreira', 'quadro', 'acesso', 'merecimento', 'antiguidade'],
  'gratificacao': ['gratificação', 'incorporação', 'vantagem', 'adicional', 'GAMA', 'GAPM'],
  'saude': ['saúde', 'afastamento', 'tratamento médico', 'licença médica', 'invalidez', 'incapacidade'],
  'disciplinar': ['disciplinar', 'sindicância', 'punição', 'advertência', 'suspensão', 'exclusão', 'expulsão'],
  'pensao': ['pensão', 'pensionista', 'dependente', 'falecimento', 'morte'],
  'reforma': ['reforma', 'reserva', 'aposentadoria', 'inatividade'],
  'concurso': ['concurso', 'nomeação', 'aprovado', 'classificado', 'edital'],
  'soldo': ['soldo', 'remuneração', 'salário', 'vencimento', 'pagamento', 'parcela'],
  'qoapm': ['QOAPM', 'auxiliar', 'quadro de oficiais', 'oficial auxiliar'],
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tema = searchParams.get('tema') || ''

  const keywords = TEMAS[tema.toLowerCase()] || [tema]
  const orCondition = keywords.map(k => `ementa.ilike.%${k}%`).join(',')

  const { data, error, count } = await supabase
    .from('decisoes_pmba')
    .select('*', { count: 'exact' })
    .or(orCondition)
    .order('data_julgamento', { ascending: false })
    .limit(200)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Estatísticas do tema
  let favoravel = 0
  const relatoresMap = {}

  for (const d of (data || [])) {
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) favoravel++
    const rel = d.relator || 'N/D'
    if (!relatoresMap[rel]) relatoresMap[rel] = { total: 0, favoravel: 0 }
    relatoresMap[rel].total++
    if (d.resultado && /concedid|provid|favorav/i.test(d.resultado)) relatoresMap[rel].favoravel++
  }

  const relatores = Object.entries(relatoresMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([relator, v]) => ({ relator, ...v, pct: v.total > 0 ? ((v.favoravel / v.total) * 100).toFixed(1) : 0 }))

  return Response.json({
    tema,
    total: count,
    favoravel,
    pct: data?.length > 0 ? ((favoravel / data.length) * 100).toFixed(1) : 0,
    relatores,
    decisoes: data?.slice(0, 50)
  })
}
