// app/(dashboard)/layout.tsx

"use client";

import AuthGuard from "@/components/guards/AuthGuard";
import { Sidebar } from "./layouts/Sidebar";
import { Topbar } from "./layouts/Topbar";
import { useUi } from "@/store";
import PermissionGuard from "@/components/guards/PermissionGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUi();

  return (
    <div className="min-h-screen bg-background">
      <AuthGuard>
        <PermissionGuard>
          <Sidebar />

          <div
            className={`transition-all duration-300 ${sidebarCollapsed ? "md:ml-18" : "md:ml-63"
              }`}
          >
            <Topbar />

            <main className="min-h-[calc(100vh-64px)] overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </PermissionGuard>
      </AuthGuard>
    </div>
  );
}
