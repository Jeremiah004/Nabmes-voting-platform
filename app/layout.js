import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Department Elections — Voter Registration",
  description: "Register your matric number ahead of the department election.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <header className="flex items-center justify-center gap-2.5 py-4 border-b border-[var(--line)]">
          <img
            src="https://zmnpienshbckxdjcahqg.supabase.co/storage/v1/object/public/candidate-photos/Nabmes%20logo.jpeg"
            alt="NABMES UNILORIN"
            className="h-9 w-9 rounded-full"
          />
          <span className="font-display text-sm tracking-tight text-[var(--ink)]">
            NABMES · UNILORIN
          </span>
        </header>
        {children}
      </body>
    </html>
  );
}
