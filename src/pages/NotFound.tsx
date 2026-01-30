import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, BookOpen, Ticket } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col mt-20">
      <Header variant="solid" showBookButton={false} />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-amber-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Search className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 mb-4">
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/"
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 min-w-[200px]"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/booking"
              className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all border-2 border-slate-200 flex items-center justify-center gap-2 min-w-[200px]"
            >
              <Ticket className="w-5 h-5" />
              Book Tickets
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Popular Pages
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                to="/"
                className="p-3 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                Home
              </Link>
              <Link
                to="/booking"
                className="p-3 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                Book Tickets
              </Link>
              <Link
                to="/book"
                className="p-3 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                Buy Book
              </Link>
              <Link
                to="/disclaimer"
                className="p-3 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                Disclaimer
              </Link>
            </div>
          </div>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-slate-100 rounded-lg text-left">
              <p className="text-xs font-mono text-slate-600">
                <strong>Debug:</strong> Attempted path: <code className="text-amber-600">{location.pathname}</code>
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
