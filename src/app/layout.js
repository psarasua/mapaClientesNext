import { Geist, Geist_Mono } from "next/font/google";
import 'bootswatch/dist/flatly/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import { QueryProvider } from '../components/providers/QueryProvider';

// Cargar variables de entorno en el servidor
if (typeof window === 'undefined') {
  require('dotenv').config();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "MapaClientes - Sistema de Gestión Logística",
  description: "Sistema integral de gestión de clientes, camiones, repartos y entregas con Next.js, React Bootstrap y SQLite",
  keywords: "gestión logística, clientes, repartos, camiones, mapas, Next.js",
  authors: [{ name: "MapaClientes Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "MapaClientes - Sistema de Gestión Logística",
    description: "Sistema integral de gestión de clientes, camiones, repartos y entregas",
    type: "website",
    images: [
      {
        url: '/logo-social.svg',
        width: 400,
        height: 200,
        alt: 'MapaClientes Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MapaClientes - Sistema de Gestión Logística",
    description: "Sistema integral de gestión de clientes, camiones, repartos y entregas",
    images: ['/logo-social.svg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
        <meta name="theme-color" content="#18bc9c" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
