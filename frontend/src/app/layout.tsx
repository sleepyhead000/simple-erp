import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";
import TutorialModal from "@/components/tutorial/TutorialModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ERP System",
  description: "Retail & Service Management ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider>
          <Providers>{children}</Providers>
        </TooltipProvider>
        <TutorialModal />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
