
import './globals.css'
import PwaRegister from './pwa-register'

export const metadata = { 
  title: 'Arihant Anchal Society', 
  description: 'Jodhpur Nagar Vritt - 530 Flats, 19 Towers, 15k sqft Clubhouse',
  manifest: '/manifest.json',
  themeColor: '#0B1120',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Arihant Anchal'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1120" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
