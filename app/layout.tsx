import type { Metadata } from "next";
import "./globals.css";
import ViewCanvas from "@/components/ViewCanvas";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata:Metadata={title:"STRYDE — Performance Wear | Interactive Studio",description:"Explore STRYDE, an independent performance-wear design concept and immersive 3D garment collection."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><ViewCanvas/><Header/><div id="main-content">{children}</div><Footer/></body></html>}
