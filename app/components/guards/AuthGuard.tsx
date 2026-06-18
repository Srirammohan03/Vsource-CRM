// app/components/AuthGuard.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
