import SideBar from "@/components/SideBar";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0f" }}>
      <SideBar />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
