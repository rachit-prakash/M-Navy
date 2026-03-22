import Navbar from "@/components/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
