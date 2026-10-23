import ViewCanvas from "@/components/ViewCanvas";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ViewCanvas />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
