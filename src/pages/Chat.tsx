import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { ChatInterface } from "@/components/chat/ChatInterface";
import AppHeader from "@/components/layout/AppHeader";
import { AlertTriangle, MessageCircle } from "lucide-react";

export default function Chat() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container max-w-3xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Wellness Chat</h1>
              <p className="text-sm text-muted-foreground">Get support, tips, and resources</p>
            </div>
          </div>
        </div>

        <Card className="mb-4 bg-amber-50 border-amber-200">
          <CardContent className="py-3">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This is an AI assistant for wellness support, not a substitute for professional help. 
                In crisis? Call 988 or text HOME to 741741.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <ChatInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
