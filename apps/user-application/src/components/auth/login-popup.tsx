import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siGoogle } from "simple-icons";

import { useState } from "react";
import { authClient } from "./client";

interface LoginPopupProps {
  children: React.ReactNode;
}

export function LoginPopup({ children }: LoginPopupProps) {
  const [loading, setLoading] = useState(false);
  const signInWithGoogle = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-2xl font-bold">
            Continue with Google
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Login or signup by continuing with Google
          </p>
        </DialogHeader>

        <div className="mt-6">
          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full h-12 text-base font-medium relative overflow-hidden group hover:bg-accent/50 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={siGoogle.path} />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="underline hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
