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
import { SaveAccountBanner } from "@/components/SaveAccountBanner";

import React, { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { stats, usage, user, loading } = useFirestore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

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
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">FinFlow AI</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-6 px-3">
          <nav className="space-y-1.5">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active={pathname === "/dashboard"} />
            <NavItem href="/dashboard/upload" icon={<Upload className="h-4 w-4" />} label="Upload Documents" active={pathname.startsWith("/dashboard/upload")} />
            <NavItem href="/dashboard/history" icon={<History className="h-4 w-4" />} label="History" active={pathname.startsWith("/dashboard/history")} />
            <NavItem href="/dashboard/templates" icon={<FileText className="h-4 w-4" />} label="Templates" active={pathname.startsWith("/dashboard/templates")} />
          </nav>

          <div className="mt-8">
            <h3 className="px-4 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2 font-mono">
              Settings
            </h3>
            <nav className="space-y-1.5">
              <NavItem href="/dashboard/subscription" icon={<CreditCard className="h-4 w-4" />} label="Subscription" active={pathname.startsWith("/dashboard/subscription")} />
              <NavItem href="/dashboard/settings" icon={<Settings className="h-4 w-4" />} label="Settings" active={pathname.startsWith("/dashboard/settings")} />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-border/50">
          {usage && (
            <Link href="/dashboard/subscription">
              <div className="bg-card border border-border/60 rounded-xl p-3.5 mb-3 hover:border-primary/40 transition-colors cursor-pointer block shadow-xs">
                {(() => {
                  const tier = stats?.subscriptionTier || "Free";
                  const limits: Record<string, number> = { Free: 10, Starter: 150, Business: 1000, Enterprise: 5000 };
                  const maxLimit = limits[tier] || 10;
                  const count = usage.monthlyUploadCount || 0;
                  const isLimit = count >= maxLimit;

                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">Monthly Usage ({tier})</span>
                        <span className={`text-[11px] font-mono ${isLimit
                          ? "text-destructive font-semibold"
                          : "text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                          }`}>
                          {count} / {maxLimit}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isLimit
                            ? "bg-destructive w-full"
                            : count >= maxLimit * 0.8
                              ? "bg-yellow-500"
                              : "bg-emerald-500"
                            }`}
                          style={{ width: `${Math.min(100, (count / maxLimit) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {isLimit ? "Limit Reached" : `${maxLimit - count} documents remaining`}
                      </p>
                    </>
                  );
                })()}
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-9 rounded-xl"
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
                        <p className="text-sm font-medium">Subscription active</p>
                        <p className="text-xs text-muted-foreground mt-1">Your {stats?.subscriptionTier || "Starter"} plan is active with full features.</p>
                        <p className="text-[10px] text-muted-foreground mt-2">Just now</p>
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
                  <Avatar className="h-8 w-8 border border-border/60">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                      {user?.displayName
                        ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                        : (user?.email ? user.email.slice(0, 2).toUpperCase() : "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || (user?.isAnonymous ? "Guest User" : "User")}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || (user?.isAnonymous ? "Trial Session (Unsaved)" : "")}
                    </p>
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

        {/* Save Account Banner for Anonymous Guests */}
        <SaveAccountBanner />

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
        className={`w-full justify-start h-9 rounded-xl text-xs font-medium transition-all ${
          active
            ? "bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        }`}
      >
        <span className={`mr-2.5 ${active ? "text-background" : "text-muted-foreground"}`}>
          {icon}
        </span>
        {label}
      </Button>
    </Link>
  );
}