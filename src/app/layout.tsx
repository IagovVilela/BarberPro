import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "BarberPro - Sistema de Gerenciamento para Barbearia",
  description: "Sistema moderno e premium de gerenciamento para barbearia. Agendamentos, clientes, financeiro e muito mais.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
