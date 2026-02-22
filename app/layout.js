import './globals.css'

export const metadata = {
  title: 'Jurimetria PMBA — TJBA',
  description: 'Sistema de análise jurimetrica — Mandados de Segurança PMBA — Seção Cível de Direito Público',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
