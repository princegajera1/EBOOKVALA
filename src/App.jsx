import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./store/AppContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Layouts
import { MarketLayout } from "./components/layout/MarketLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminRoute } from "./components/layout/AdminRoute";
import { GuestRoute } from "./components/layout/GuestRoute";
import { ScrollToTop } from "./components/layout/ScrollToTop";

// Pages
import { Landing } from "./pages/Landing";
import { Marketplace } from "./pages/Marketplace";
import { BookDetail } from "./pages/BookDetail";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { FAQ } from "./pages/FAQ";
import { HelpCenter } from "./pages/HelpCenter";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { AdminLogin } from "./pages/auth/AdminLogin";
import { SecretAdminEntry } from "./pages/auth/SecretAdminEntry";
import { ReaderDashboard } from "./pages/reader/ReaderDashboard";
import { Reader } from "./pages/reader/Reader";
import { AuthorDashboard } from "./pages/author/AuthorDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { NotFound } from "./pages/NotFound";

// New Pages
import { OurMission } from "./pages/OurMission";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { SearchResults } from "./pages/SearchResults";

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

              {/* Secret Admin Entry — password only, no Firebase needed */}
              <Route path="/635284" element={<SecretAdminEntry />} />

              {/* Dashboard routes (Role protection enforced via ProtectedRoute / AdminRoute) */}
              <Route path="/dashboard" element={
                <ProtectedRoute role="reader">
                  <ReaderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/read/:slug" element={
                <ProtectedRoute role="reader">
                  <Reader />
                </ProtectedRoute>
              } />
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
