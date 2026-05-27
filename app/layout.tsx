import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Pearson Hardman Motors — Meet CARLO, Your AI Car Salesman",
  description:
    "Quality used cars in Metro Manila. Talk to CARLO, our AI sales agent, available 24/7 to answer questions and negotiate the best deal on any car in our lineup.",
  generator: "v0.app",
  openGraph: {
    title: "Pearson Hardman Motors — Meet CARLO",
    description: "Your AI car salesman. Always ready.",
    type: "website",
  },
}

export const viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
