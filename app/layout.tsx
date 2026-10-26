import type { Metadata } from "next";
import "@/index.css";

export const metadata: Metadata = {
  title: "Cloudinary Gallery - MD. Shinha Sarder",
  description: "Personal media showcase architecture and official assets of MD. Shinha Sarder",
  openGraph: {
    title: "Cloudinary Gallery - MD. Shinha Sarder",
    description: "Official portfolio, high-resolution media gallery, and Cloudinary CDN assets of MD. Shinha Sarder.",
    images: ["https://mdshinhasarder.com/images/md-shinha-sarder-official-portrait.profile.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
