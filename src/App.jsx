import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./store/AppContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Layouts (always loaded — no lazy needed)
import { MarketLayout } from "./components/layout/MarketLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminRoute } from "./components/layout/AdminRoute";
import { GuestRoute } from "./components/layout/GuestRoute";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import ShapeGrid from "./components/ShapeGrid/ShapeGrid";

// Critical pages — loaded eagerly (above the fold)
import { Landing } from "./pages/Landing";
import { Marketplace } from "./pages/Marketplace";
import { BookDetail } from "./pages/BookDetail";

// Non-critical pages — lazy loaded for code splitting
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
const FAQ = lazy(() => import("./pages/FAQ").then(m => ({ default: m.FAQ })));
const HelpCenter = lazy(() => import("./pages/HelpCenter").then(m => ({ default: m.HelpCenter })));
const OurMission = lazy(() => import("./pages/OurMission").then(m => ({ default: m.OurMission })));
const Terms = lazy(() => import("./pages/Terms").then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import("./pages/Privacy").then(m => ({ default: m.Privacy })));
const SearchResults = lazy(() => import("./pages/SearchResults").then(m => ({ default: m.SearchResults })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));

// Auth pages — lazy loaded
const Login = lazy(() => import("./pages/auth/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/auth/Register").then(m => ({ default: m.Register })));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin").then(m => ({ default: m.AdminLogin })));
const SecretAdminEntry = lazy(() => import("./pages/auth/SecretAdminEntry").then(m => ({ default: m.SecretAdminEntry })));

// Dashboard pages — largest, always lazy loaded
const ReaderDashboard = lazy(() => import("./pages/reader/ReaderDashboard").then(m => ({ default: m.ReaderDashboard })));
const Reader = lazy(() => import("./pages/reader/Reader").then(m => ({ default: m.Reader })));
const AuthorDashboard = lazy(() => import("./pages/author/AuthorDashboard").then(m => ({ default: m.AuthorDashboard })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));

// Minimal full-screen loader for Suspense fallback
const PageLoader = () => (
  <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg, #fff)" }}>
    <svg style={{ height: 28, width: 28, animation: "spin 1s linear infinite", color: "var(--accent, #7c3aed)" }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <ScrollToTop />
            
            {/* Global ShapeGrid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <ShapeGrid 
                shape="hexagon" 
                direction="diagonal" 
                speed={0.3} 
                squareSize={48} 
                hoverTrailAmount={6} 
              />
            </div>
            
            <div className="relative z-10 min-h-screen">
              <Suspense fallback={<PageLoader />}>
                <Routes>
              
              {/* Public Marketplace / Landing routes */}
              <Route element={<MarketLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/book/:slug" element={<BookDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/our-mission" element={<OurMission />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Authentication routes (Guest protected) */}
              <Route path="/login" element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } />
              <Route path="/register" element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } />
              <Route path="/admin/login" element={
                <GuestRoute>
                  <AdminLogin />
                </GuestRoute>
              } />
              <Route path="/admin2412" element={
                <GuestRoute>
                  <SecretAdminEntry />
                </GuestRoute>
              } />



              {/* Dashboard routes (Role protection enforced via ProtectedRoute / AdminRoute) */}
              <Route path="/dashboard" element={
                <ProtectedRoute role="reader">
                  <ReaderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/read/:slug" element={<Reader />} />
              <Route path="/author/dashboard" element={
                <ProtectedRoute role="author">
                  <AuthorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

            </Routes>
              </Suspense>
            </div>
          </BrowserRouter>
        
        {/* Sleek, Minimal React Hot Toast */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              fontSize: "12px",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              padding: "10px 16px"
            },
             success: {
              iconTheme: {
                primary: "#16A34A",
                secondary: "#FFFFFF"
              }
            }
          }}
        />
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
}

export default App;
