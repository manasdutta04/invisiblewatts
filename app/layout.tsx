import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "InvisibleWatts — Digital Carbon Tracker",
  description: "Track and reduce the hidden CO₂ cost of your digital life. Upload screen time data, get AI-powered insights, and lower your digital carbon footprint.",
  icons: { icon: "/logo.svg" },
}

const disableTransitionOnChange = false

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

