"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, ArrowLeft, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      // Common in preview/Tempo environments when the current domain isn't in Firebase Auth "Authorized domains"
      if (err?.code === "auth/unauthorized-domain") {
        setError(
          "Google sign-in isn’t enabled for this preview URL yet. Please use email/password, or add this domain to Firebase Auth → Settings → Authorized domains."
        );
      } else {
        console.error("Google login error:", err);
        setError("Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setVerificationNeeded(true);
      } else {
        const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
        const isNewUser = Date.now() - creationTime < 5 * 60 * 1000; // Account created in last 5 minutes
        if (isNewUser) {
          router.push("/pricing?new_account=true");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Email or password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  if (verificationNeeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden px-4">
        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-primary/15 via-purple-500/10 to-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="w-full max-w-md py-12 z-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-3xl font-normal tracking-[-0.02em] text-foreground">Verify your email</h1>
          </div>

          <Card className="border border-border/80 shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-xl rounded-2xl">
            <CardContent className="pt-8 pb-8 px-6 space-y-5 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We have sent you a verification email to <span className="font-medium text-foreground">{email}</span>. Please verify it and log in.
              </p>
              <Button
                className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium text-xs shadow-sm transition-all"
                onClick={() => setVerificationNeeded(false)}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden px-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-primary/15 via-purple-500/10 to-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      
      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-card/40 border border-border/60 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md py-12 z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          {/* Logo Badge */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-[-0.02em] text-foreground">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-normal">
            Enter your credentials to access your financial dashboard
          </p>
        </div>

        <Card className="border border-border/80 shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Sign In</CardTitle>
            <CardDescription className="text-xs">Enter your email and password below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              type="button"
              className="w-full h-10 rounded-full border-border/80 bg-background/50 hover:bg-muted/60 text-xs font-medium"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2 text-xs rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl bg-background/60 border-border/70 focus:border-primary text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                  <Link href="#" className="text-[11px] text-primary hover:underline">Forgot password?</Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl bg-background/60 border-border/70 focus:border-primary text-xs"
                />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="remember" className="rounded" />
                <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground cursor-pointer">Remember me for 30 days</Label>
              </div>
              <Button
                className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium text-xs shadow-sm mt-2 transition-all"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-2 pb-6 border-t border-border/40 flex justify-center">
            <div className="text-center text-xs text-muted-foreground">
              Don't have an account? <Link href="/signup" className="text-foreground font-semibold hover:underline">Sign up</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
