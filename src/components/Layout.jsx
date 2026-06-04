import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-blue-50 dark:bg-zinc-950 transition-colors">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      <Footer />
    </div>
  );
}