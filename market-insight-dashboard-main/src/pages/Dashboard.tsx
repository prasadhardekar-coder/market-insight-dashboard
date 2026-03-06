import { useState } from "react";
import MarketChart from "@/components/MarketChart";
import PredictionPanel from "@/components/PredictionPanel";
import NewsFeed from "@/components/NewsFeed";
import SocialFeed from "@/components/SocialFeed";
import AIChatbot from "@/components/AIChatbot";
import { BarChart3, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [symbol, setSymbol] = useState("AAPL");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("auth_user") || '{"email":"user@demo.com"}');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">SentimentAI</h1>
          <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                <User className="w-4 h-4 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Dashboard grid */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4 min-h-0">
        {/* Left column */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-[350px]">
            <MarketChart symbol={symbol} onSymbolChange={setSymbol} />
          </div>
          <div className="flex-1 min-h-[300px]">
            <PredictionPanel symbol={symbol} />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-[350px]">
            <NewsFeed symbol={symbol} />
          </div>
          <div className="flex-1 min-h-[300px]">
            <SocialFeed symbol={symbol} />
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
