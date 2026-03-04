import './globals.css'

export const metadata = {
  title: 'Darun Nazat Madrasa',
  description: 'Educational Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
