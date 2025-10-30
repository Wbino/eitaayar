import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata = {
  title: "زمان‌بندی پیام ایتا",
  description: "ارسال خودکار پیام‌ها در گروه ایتا برای مامان ❤️",
  manifest: "/manifest.json",
  themeColor: "#121212",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-[var(--font-vazirmatn)] bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
