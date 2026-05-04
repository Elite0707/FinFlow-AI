"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Upload,
  History,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  Search,
  Menu,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useFirestore } from "@/hooks/useFirestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { stats, usage, user } = useFirestore();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm fixed inset-y-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <span>FinFlow AI</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-6 px-3">
          <nav className="space-y-2">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" active={pathname === "/dashboard"} />
            <NavItem href="/dashboard/upload" icon={<Upload className="h-5 w-5" />} label="Upload Documents" active={pathname.startsWith("/dashboard/upload")} />
            <NavItem href="/dashboard/history" icon={<History className="h-5 w-5" />} label="History" active={pathname.startsWith("/dashboard/history")} />
            <NavItem href="/dashboard/templates" icon={<FileText className="h-5 w-5" />} label="Templates" active={pathname.startsWith("/dashboard/templates")} />
          </nav>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Settings
            </h3>
            <nav className="space-y-2">
              <NavItem href="/dashboard/subscription" icon={<CreditCard className="h-5 w-5" />} label="Subscription" active={pathname.startsWith("/dashboard/subscription")} />
              <NavItem href="/dashboard/settings" icon={<Settings className="h-5 w-5" />} label="Settings" active={pathname.startsWith("/dashboard/settings")} />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-border/50">
          {usage && (
            <Link href="/dashboard/subscription">
              <div className="bg-primary/10 rounded-lg p-4 mb-4 hover:bg-primary/15 transition-colors cursor-pointer block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">Monthly Usage</span>
                  <span className={`text-xs ${usage.monthlyUploadCount >= 10
                    ? "text-destructive font-bold"
                    : "text-muted-foreground bg-primary/20 px-1.5 py-0.5 rounded"
                    }`}>
                    {usage.monthlyUploadCount} / 10
                  </span>
                </div>
                <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${usage.monthlyUploadCount >= 10
                      ? "bg-destructive w-full"
                      : usage.monthlyUploadCount >= 8
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                      }`}
                    style={{ width: `${Math.min(100, (usage.monthlyUploadCount / 10) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {usage.monthlyUploadCount >= 10 ? "Limit Reached" : "Resets in 30 days"}
                </p>
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                {/* Mobile Sidebar Content - duplicated simplified */}
                <div className="h-full flex flex-col bg-card">
                  <div className="h-16 flex items-center px-6 border-b border-border/50">
                    <div className="flex items-center gap-2 font-bold text-xl">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span>FinFlow AI</span>
                    </div>
                  </div>
                  <nav className="flex-1 py-6 px-3 space-y-2">
                    <NavItem href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" active={pathname === "/dashboard"} />
                    <NavItem href="/dashboard/upload" icon={<Upload className="h-5 w-5" />} label="Upload Documents" active={pathname.startsWith("/dashboard/upload")} />
                    <NavItem href="/dashboard/history" icon={<History className="h-5 w-5" />} label="History" active={pathname.startsWith("/dashboard/history")} />
                    <NavItem href="/dashboard/templates" icon={<FileText className="h-5 w-5" />} label="Templates" active={pathname.startsWith("/dashboard/templates")} />
                    <NavItem href="/dashboard/subscription" icon={<CreditCard className="h-5 w-5" />} label="Subscription" active={pathname.startsWith("/dashboard/subscription")} />
                    <NavItem href="/dashboard/settings" icon={<Settings className="h-5 w-5" />} label="Settings" active={pathname.startsWith("/dashboard/settings")} />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents, templates..."
                className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full"></span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <span className="text-xs text-muted-foreground">2 new</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Batch processing complete</p>
                        <p className="text-xs text-muted-foreground mt-1">"Invoice_Batch_001.pdf" has been processed successfully.</p>
                        <p className="text-[10px] text-muted-foreground mt-2">2 mins ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Subscription renewed</p>
                        <p className="text-xs text-muted-foreground mt-1">Your Pro plan has been renewed for November.</p>
                        <p className="text-[10px] text-muted-foreground mt-2">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full text-xs">View all notifications</Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/subscription">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={`w-full justify-start h-10 ${
          active
            ? "bg-primary/15 text-primary font-semibold hover:bg-primary/20 hover:text-primary border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        <span className={`mr-3 ${active ? "text-primary" : ""}`}>
          {icon}
        </span>
        {label}
      </Button>
    </Link>
  );
}