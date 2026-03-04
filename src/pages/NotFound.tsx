import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Access attempt to:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />

      <div className="glass p-12 rounded-[3rem] border border-white/5 shadow-2xl max-w-lg w-full text-center relative z-10">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-8 shadow-lg">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="text-7xl font-black text-foreground mb-4 tracking-tighter">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-2">Vault Sector Missing</h2>
        <p className="text-sm text-muted-foreground font-medium mb-10 leading-relaxed px-6">
          The coordinates for <span className="font-mono text-primary/80">{location.pathname}</span> could not be resolved within the Astra Vault matrix.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="glass border-white/5 rounded-2xl h-12 px-6 hover:bg-white/10 transition-all font-bold">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return
            </Link>
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="glow-amber h-12 px-8 rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Main Vault
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
