import { Footer } from "@/src/components/footer";
import Header from "@/src/components/header";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
