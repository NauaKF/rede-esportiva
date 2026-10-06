import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rede Esportiva | Encontre seu próximo jogo",
  description:
    "Conecte-se com jogadores e encontre arenas para tênis, beach tennis e vôlei.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
