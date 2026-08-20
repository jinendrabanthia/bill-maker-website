import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Cloud, UserCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-[family-name:var(--font-geist-sans)]">
      
      {/* Header */}
      <header className="w-full bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[#1B4B66]">
          <FileText className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight">Bill Maker</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-[#1B4B66] hover:bg-blue-50">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#1B4B66] hover:bg-[#153a50]">Sign up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-24 pb-32 px-6 md:px-12 flex flex-col items-center text-center overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 inset-x-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 -z-10"></div>
          
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Create Professional Bills in <span className="text-[#1B4B66]">Seconds.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Streamline your order management, automatically generate beautiful PDF invoices, and keep track of all your sales in one powerful dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-[#1B4B66] hover:bg-[#153a50] text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-xl transition-all">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full border-gray-300 hover:bg-gray-100 transition-all">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white px-6 md:px-12">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything you need to manage orders</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">Built for modern businesses who want to save time and look professional.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4 p-6 rounded-2xl bg-blue-50 border border-blue-100 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#1B4B66]">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Lightning Fast Invoices</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create detailed order forms with product images and instantly generate shareable, perfectly formatted PDF bills.
                </p>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-indigo-600">
                  <Cloud className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Cloud Synced</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access your orders and invoices from anywhere, on any device. Your data is securely backed up in the cloud.
                </p>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-sky-50 border border-sky-100 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-sky-600">
                  <UserCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Customizable Profiles</h3>
                <p className="text-gray-600 leading-relaxed">
                  Save your company and supplier details to auto-fill future invoices, eliminating repetitive typing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6 md:px-12 text-center text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white opacity-80">
            <FileText className="h-5 w-5" />
            <span className="font-semibold tracking-tight">Bill Maker</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Bill Maker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
