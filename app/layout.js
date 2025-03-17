// app/layout.js
import { Providers } from "./providers";
import "./globals.css"; // Make sure this import exists

export const metadata = {
  title: "Insane Dashboard",
  description: "A clean, minimal dashboard for domain management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
