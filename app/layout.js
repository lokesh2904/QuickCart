import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "QuickCart - GreatStack",
  description: "E-Commerce with Next.js ",
};

export default function RootLayout({ children }) {
  return (
    // CHANGE 1: ClerkProvider should be inside the <html> tag.
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${outfit.className} antialiased text-gray-700`} >
        {/* CHANGE 2: Nest all providers inside the <body> tag. */}
        {/* ClerkProvider should wrap any components/contexts that need user data. */}
        <ClerkProvider>
          <AppContextProvider>
            <Toaster />
            {children}
          </AppContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}