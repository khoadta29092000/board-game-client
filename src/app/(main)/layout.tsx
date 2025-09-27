import { Footer } from "@/src/components/footer";
import Header from "@/src/components/header";
import { SignalRProvider } from "@/src/components/signalR/signalRProvider";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <SignalRProvider>{children}</SignalRProvider>;
      <Footer />
    </>
  );
}
