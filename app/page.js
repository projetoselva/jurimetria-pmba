'use client'
import { useState, useEffect } from 'react'

const TEMAS = [
  { key: 'promocao', label: 'Promoção', icon: '⬆' },
  { key: 'gratificacao', label: 'Gratificação', icon: '💰' },
  { key: 'saude', label: 'Saúde', icon: '🏥' },
  { key: 'disciplinar', label: 'Disciplinar', icon: '⚖' },
  { key: 'pensao', label: 'Pensão', icon: '📋' },
  { key: 'reforma', label: 'Reforma/Reserva', icon: '🎖' },
  { key: 'concurso', label: 'Concurso', icon: '📝' },
  { key: 'soldo', label: 'Soldo/Vencimento', icon: '💼' },
  { key: 'qoapm', label: 'QOAPM', icon: '🎯' },
]

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '20px 24px',
      borderLeft: `3px solid ${color || '#2563eb'}`
    }}>
      <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: '#e2e8f0' }}>{value}</div>
      {sub && <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function PctBar({ pct, label }) {
  const num = parseFloat(pct)
  const color = num >= 60 ? '#16a34a' : num >= 45 ? '#d97706' : '#dc2626'
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#cbd5e1' }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: 'IBM Plex Mono', color }}>{pct}%</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6 }}>
        <div style={{ width: `${Math.min(num, 100)}%`, background: color, borderRadius: 4, height: 6, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

export default function Home() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [temaSel, setTemaSel] = useState(null)
  const [temaData, setTemaData] = useState(null)
  const [magistradoQ, setMagistradoQ] = useState('')
  const [magistradoData, setMagistradoData] = useState(null)
  const [aba, setAba] = useState('dashboard')

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function pesquisar(e) {
    e.preventDefault()
    if (!busca.trim()) return
    setBuscando(true)
    const r = await fetch(`/api/decisoes?q=${encodeURIComponent(busca)}`)
    const d = await r.json()
    setResultados(d)
    setBuscando(false)
    setAba('pesquisa')
  }

  async function carregarTema(tema) {
    setTemaSel(tema)
    setTemaData(null)
    setAba('tema')
    const r = await fetch(`/api/pesquisa?tema=${tema}`)
    const d = await r.json()
    setTemaData(d)
  }

  async function carregarMagistrado(e) {
    e.preventDefault()
    if (!magistradoQ.trim()) return
    setMagistradoData(null)
    setAba('magistrado')
    const r = await fetch(`/api/magistrados?nome=${encodeURIComponent(magistradoQ)}`)
    const d = await r.json()
    setMagistradoData(d)
  }

  const s = stats

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1b2a' }}>
      {/* Sidebar */}
      <div style={{
        width: 240, flexShrink: 0, background: '#0a1628',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700, color: '#c9a84c', lineHeight: 1.3 }}>
            Jurimetria<br/>PMBA
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            TJBA · Seção Cível
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '◈' },
            { id: 'pesquisa', label: 'Pesquisa', icon: '⌕' },
            { id: 'tema', label: 'Por Tema', icon: '◉' },
            { id: 'magistrado', label: 'Magistrado', icon: '⊛' },
          ].map(item => (
            <button key={item.id} onClick={() => setAba(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 20px', background: aba === item.id ? 'rgba(37,99,235,0.15)' : 'transparent',
              border: 'none', cursor: 'pointer', color: aba === item.id ? '#93c5fd' : '#64748b',
              fontSize: 13, textAlign: 'left', borderLeft: aba === item.id ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: 1 }}>
            2020 – 2025<br/>
            {s ? `${s.total?.toLocaleString('pt-BR')} decisões` : '...'}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 240, flex: 1, padding: '32px 40px', maxWidth: 1200 }}>

        {/* DASHBOARD */}
        {aba === 'dashboard' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: '#e2e8f0' }}>
                Painel Jurimetrico
              </h1>
              <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
                Mandados de Segurança · PMBA · Seção Cível de Direito Público · TJBA
              </p>
            </div>

            {loading ? (
              <div style={{ color: '#475569', fontSize: 14 }}>Carregando dados...</div>
            ) : s ? (
              <>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                  <StatCard label="Total de Decisões" value={s.total?.toLocaleString('pt-BR')} sub="2020–2025" color="#2563eb" />
                  <StatCard label="Relatores Ativos" value={s.relatores?.length} sub="Identificados" color="#c9a84c" />
                  <StatCard label="Temas Mapeados" value={s.temas?.length} sub="Categorias" color="#7c3aed" />
                  <StatCard
                    label="Taxa Favorável Geral"
                    value={`${s.relatores?.length > 0 ? (s.relatores.reduce((a,r) => a + parseFloat(r.pct||0), 0) / s.relatores.length).toFixed(1) : '--'}%`}
                    sub="Média dos relatores"
                    color="#16a34a"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                  {/* Relatores */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>
                      Ranking de Relatores
                    </h3>
                    {s.relatores?.slice(0, 10).map((r, i) => (
                      <div key={r.relator} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: '#475569', width: 20 }}>
                          {String(i+1).padStart(2,'0')}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>
                            {r.relator.replace(/^Des\.?\s*/i,'').replace(/^Desa\.?\s*/i,'')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 4 }}>
                              <div style={{
                                width: `${(r.total / s.relatores[0].total) * 100}%`,
                                background: '#2563eb', borderRadius: 3, height: 4
                              }} />
                            </div>
                            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: '#64748b', minWidth: 30 }}>{r.total}</span>
                            <span style={{
                              fontFamily: 'IBM Plex Mono', fontSize: 11,
                              color: parseFloat(r.pct) >= 55 ? '#16a34a' : parseFloat(r.pct) >= 40 ? '#d97706' : '#dc2626',
                              minWidth: 40
                            }}>{r.pct}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setAba('magistrado')} style={{
                      marginTop: 12, fontSize: 12, color: '#3b82f6', background: 'none', border: 'none',
                      cursor: 'pointer', padding: 0
                    }}>Ver perfil completo →</button>
                  </div>

                  {/* Evolução por Ano */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>
                      Evolução Temporal
                    </h3>
                    {s.anos?.map(a => (
                      <div key={a.ano} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#94a3b8' }}>{a.ano}</span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{a.total} decisões · <span style={{ color: parseFloat(a.pct) >= 50 ? '#16a34a' : '#dc2626' }}>{a.pct}% fav.</span></span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 6, position: 'relative' }}>
                          <div style={{
                            width: `${(a.total / Math.max(...s.anos.map(x => x.total))) * 100}%`,
                            background: 'rgba(37,99,235,0.5)', borderRadius: 3, height: 6, position: 'absolute'
                          }} />
                          <div style={{
                            width: `${(a.favoravel / Math.max(...s.anos.map(x => x.total))) * 100}%`,
                            background: '#16a34a', borderRadius: 3, height: 6, position: 'absolute'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Temas */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>
                    Acesso Rápido por Tema
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {TEMAS.map(t => (
                      <button key={t.key} onClick={() => carregarTema(t.key)} style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10, padding: '14px 16px',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s', color: '#cbd5e1'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      >
                        <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{t.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: '#ef4444', fontSize: 14 }}>Erro ao carregar dados. Verifique a conexão com o Supabase.</div>
            )}
          </div>
        )}

        {/* PESQUISA */}
        {aba === 'pesquisa' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: '#e2e8f0' }}>Pesquisa de Decisões</h1>
              <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Busca full-text em ementas e números de processo</p>
            </div>

            <form onSubmit={pesquisar} style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Ex: incorporação gratificação, promoção por merecimento, QOAPM..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '12px 16px', color: '#e2e8f0', fontSize: 14, outline: 'none',
                  fontFamily: 'Source Sans 3'
                }}
              />
              <button type="submit" style={{
                background: '#2563eb', border: 'none', borderRadius: 8, padding: '12px 24px',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>
                {buscando ? '...' : 'Pesquisar'}
              </button>
            </form>

            {resultados && (
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  {resultados.count} resultados · Página {resultados.page} de {resultados.pages}
                </div>
                {resultados.data?.map(d => (
                  <div key={d.id || d.hash || Math.random()} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, padding: 20, marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#3b82f6' }}>
                        {d.numero_processo || d.processo || 'N/D'}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {d.resultado && (
                          <span style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                            background: /concedid|provid/i.test(d.resultado) ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                            color: /concedid|provid/i.test(d.resultado) ? '#86efac' : '#fca5a5',
                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5
                          }}>
                            {d.resultado}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#475569', fontFamily: 'IBM Plex Mono' }}>
                          {d.data_julgamento ? d.data_julgamento.substring(0, 10) : ''}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                      {d.relator && <span>↳ {d.relator}</span>}
                      {d.tema && <span style={{ marginLeft: 16, color: '#475569' }}>· {d.tema}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                      {d.ementa ? d.ementa.substring(0, 300) + (d.ementa.length > 300 ? '...' : '') : 'Ementa não disponível'}
                    </p>
                    {d.hash && (
                      <a href={`https://jurisprudenciaws.tjba.jus.br/inteiroTeor/${d.hash}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: '#3b82f6', marginTop: 8, display: 'inline-block' }}>
                        Ver íntegra ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEMA */}
        {aba === 'tema' && (
          <div>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => setAba('dashboard')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>
                ← Voltar
              </button>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: '#e2e8f0' }}>
                Análise por Tema
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
              {TEMAS.map(t => (
                <button key={t.key} onClick={() => carregarTema(t.key)} style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  background: temaSel === t.key ? '#2563eb' : 'rgba(255,255,255,0.05)',
                  border: temaSel === t.key ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.1)',
                  color: temaSel === t.key ? '#fff' : '#94a3b8', transition: 'all 0.15s'
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {!temaData && <div style={{ color: '#475569', fontSize: 14 }}>Carregando análise do tema...</div>}

            {temaData && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                  <StatCard label="Decisões no Tema" value={temaData.total?.toLocaleString('pt-BR')} color="#2563eb" />
                  <StatCard label="Taxa Favorável" value={`${temaData.pct}%`}
                    color={parseFloat(temaData.pct) >= 55 ? '#16a34a' : parseFloat(temaData.pct) >= 40 ? '#d97706' : '#dc2626'} />
                  <StatCard label="Favoráveis" value={temaData.favoravel?.toLocaleString('pt-BR')} color="#16a34a" />
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>
                    Performance por Relator neste Tema
                  </h3>
                  {temaData.relatores?.slice(0, 12).map(r => (
                    <PctBar key={r.relator} label={`${r.relator} (${r.total})`} pct={r.pct} />
                  ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>
                    Decisões Recentes
                  </h3>
                  {temaData.decisoes?.slice(0, 10).map((d, i) => (
                    <div key={i} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 16
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#3b82f6' }}>{d.numero_processo || d.processo}</span>
                        <span style={{ fontSize: 11, color: '#475569', fontFamily: 'IBM Plex Mono' }}>{d.data_julgamento?.substring(0,10)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{d.relator}</div>
                      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                        {d.ementa?.substring(0, 250)}...
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* MAGISTRADO */}
        {aba === 'magistrado' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: '#e2e8f0' }}>Perfil do Magistrado</h1>
              <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Análise individual de perfil decisório</p>
            </div>

            <form onSubmit={carregarMagistrado} style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <input
                value={magistradoQ}
                onChange={e => setMagistradoQ(e.target.value)}
                placeholder="Ex: Landin, Chenaud, Carmem, Aras..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '12px 16px', color: '#e2e8f0', fontSize: 14, outline: 'none',
                  fontFamily: 'Source Sans 3'
                }}
              />
              <button type="submit" style={{
                background: '#2563eb', border: 'none', borderRadius: 8, padding: '12px 24px',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>Analisar</button>
            </form>

            {/* Atalhos rápidos */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {['Landin', 'Chenaud', 'Carmem', 'Aras', 'Bispo', 'Carneiro', 'Cafezeiro', 'Jatahy', 'Kertzman'].map(n => (
                <button key={n} onClick={() => { setMagistradoQ(n); carregarMagistrado({ preventDefault: () => {} }); setMagistradoQ(n) }} style={{
                  padding: '6px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', transition: 'all 0.15s'
                }}>
                  {n}
                </button>
              ))}
            </div>

            {magistradoData && (
              <>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: 24, marginBottom: 24,
                  borderLeft: `4px solid ${parseFloat(magistradoData.pct) >= 55 ? '#16a34a' : parseFloat(magistradoData.pct) >= 40 ? '#d97706' : '#dc2626'}`
                }}>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, color: '#e2e8f0', marginBottom: 4 }}>
                    {magistradoData.relator}
                  </h2>
                  <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 }}>Total</div>
                      <div style={{ fontFamily: 'Playfair Display', fontSize: 28, color: '#e2e8f0' }}>{magistradoData.total}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 }}>Favoráveis</div>
                      <div style={{ fontFamily: 'Playfair Display', fontSize: 28, color: '#16a34a' }}>{magistradoData.favoravel}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 }}>Taxa Favorável</div>
                      <div style={{ fontFamily: 'Playfair Display', fontSize: 28, color: parseFloat(magistradoData.pct) >= 55 ? '#16a34a' : parseFloat(magistradoData.pct) >= 40 ? '#d97706' : '#dc2626' }}>
                        {magistradoData.pct}%
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>Por Tema</h3>
                    {magistradoData.temas?.map(t => <PctBar key={t.tema} label={`${t.tema} (${t.total})`} pct={t.pct} />)}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>Por Ano</h3>
                    {magistradoData.anos?.map(a => <PctBar key={a.ano} label={`${a.ano} (${a.total})`} pct={a.pct} />)}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, marginTop: 24 }}>
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 20, color: '#cbd5e1' }}>Decisões Recentes</h3>
                  {magistradoData.recentes?.map((d, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 14, marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#3b82f6' }}>{d.numero_processo || d.processo}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {d.resultado && (
                            <span style={{
                              fontSize: 10, padding: '2px 8px', borderRadius: 10,
                              background: /concedid|provid/i.test(d.resultado) ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                              color: /concedid|provid/i.test(d.resultado) ? '#86efac' : '#fca5a5'
                            }}>{d.resultado}</span>
                          )}
                          <span style={{ fontSize: 11, color: '#475569', fontFamily: 'IBM Plex Mono' }}>{d.data_julgamento?.substring(0,10)}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{d.ementa?.substring(0,200)}...</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
