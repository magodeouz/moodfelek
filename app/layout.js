import './globals.css'

export const metadata = {
  title: 'Mood Çarkı',
  description: 'İnteraktif Mood Çarkı uygulaması',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}

