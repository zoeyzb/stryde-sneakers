import type { Metadata } from "next";
import "./globals.css";
import ViewCanvas from "@/components/ViewCanvas";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata:Metadata={title:"STRYDE — Performance Wear | Interactive Studio",description:"Explore STRYDE, an independent performance-wear design concept and immersive 3D garment collection."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a href="#main-content" style={{position:"absolute",left:-9999,top:0,zIndex:1000}} onFocus={e=>e.currentTarget.style.left="12px"} onBlur={e=>e.currentTarget.style.left="-9999px"}>Skip to content</a><ViewCanvas/><Header/><div id="main-content">{children}</div><Footer/></body></html>}
