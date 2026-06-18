"use client";

import { useEffect } from "react";
import { useAuth } from "@/store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrateUser = useAuth((s) => s.hydrateUser);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  return <>{children}</>;
}
