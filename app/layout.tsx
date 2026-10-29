import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { Footer, Header } from "@/components/header";
import { MotionProvider } from "@/components/motion";
import "./globals.css";

const grotesk = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: { default: "DiCampus · Le campus en ligne de Diego", template: "%s · DiCampus" },
  description: "DiegoCampus : cours et formations en ligne pour le monde universitaire d’Antsiranana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={grotesk.variable}>
      <body>
        <MotionProvider>
          <main className="relative w-full overflow-x-clip">
            <Header />
            {children}
            <Footer />
          </main>
        </MotionProvider>
      </body>
    </html>
  );
}
