import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="text-8xl font-black text-primary/20 select-none">404</div>
        <h1 className="text-2xl font-bold text-foreground">পৃষ্ঠা খুঁজে পাওয়া যায়নি</h1>
        <p className="text-muted-foreground">
          আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরানো হয়েছে, মুছে ফেলা হয়েছে, অথবা এর ঠিকানা পরিবর্তন করা হয়েছে।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild variant="default" className="gap-2">
            <Link to="/"><Home className="w-4 h-4" /> হোমে যান</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <span><ArrowLeft className="w-4 h-4" /> পেছনে যান</span>
          </Button>
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/services"><Search className="w-4 h-4" /> সার্ভিস দেখুন</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
