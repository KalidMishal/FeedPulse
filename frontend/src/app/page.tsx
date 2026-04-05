import FeedbackForm from '@/components/FeedbackForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none" />

      <nav className="relative z-10 w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
             F
          </div>
          <span className="font-bold text-xl tracking-tight">FeedPulse</span>
        </div>
        <Link 
          href="/admin/login" 
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Admin Login
        </Link>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900">
            Help us build the <br/> future of our product.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Your feedback goes directly to our product team. Powered by AI, we analyze, prioritize, and act on your ideas instantly to build what matters most to you.
          </p>
        </div>

        <FeedbackForm />
      </main>
    </div>
  );
}
