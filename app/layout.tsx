
import './globals.css'
export const metadata = { title: 'Arihant Anchal Society', description: 'Jodhpur Nagar Vritt' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="hi"><body>{children}</body></html>)
}
