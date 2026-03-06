import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Settings, LogOut, Mail, Phone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("auth_user") || '{"email":"user@demo.com","phone":""}');

  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [name, setName] = useState(user.name || "");
  const [notifications, setNotifications] = useState(true);
  const [darkCharts, setDarkCharts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("auth_user", JSON.stringify({ email, phone, name }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Profile & Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Details</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">{name || email}</h2>
                  <p className="text-sm text-muted-foreground">Member</p>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label htmlFor="email2">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email2" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone2">Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone2" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border pl-10" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Changes"}
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" /> Log Out
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive alerts for price changes and predictions</div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Charts</div>
                  <div className="text-sm text-muted-foreground">Use dark theme for chart visualizations</div>
                </div>
                <Switch checked={darkCharts} onCheckedChange={setDarkCharts} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Refresh Data</div>
                  <div className="text-sm text-muted-foreground">Automatically refresh market data every 30 seconds</div>
                </div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
