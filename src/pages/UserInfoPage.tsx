import { useAuth } from "@/contexts/AuthContext";
import { UserInfo } from "@/components/UserInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

export default function UserInfoPage() {
  const { user, profile } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getDashboardLink = () => {
    if (!profile) return '/';
    
    switch (profile.user_role) {
      case 'admin':
        return '/admin-dashboard';
      case 'professional':
        return '/professional-dashboard';
      case 'client':
        return '/cliente-dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link to={getDashboardLink()} className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Link>
        
        <UserInfo />
      </div>
    </div>
  );
}