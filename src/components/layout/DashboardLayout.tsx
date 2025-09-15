import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfessionalSidebar } from "./ProfessionalSidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  type: "professional" | "admin";
}

export function DashboardLayout({ children, type }: DashboardLayoutProps) {
  const { profile } = useAuth();

  const SidebarComponent = type === "professional" ? ProfessionalSidebar : AdminSidebar;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarComponent />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="font-semibold">
                {type === "professional" ? "Painel do Profissional" : "Painel Administrativo"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Olá, {profile?.full_name}
              </span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}