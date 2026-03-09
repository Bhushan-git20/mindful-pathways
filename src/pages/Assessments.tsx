import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentForm } from "@/components/assessments/AssessmentForm";
import PageShell from "@/components/layout/PageShell";
import { ArrowLeft, ClipboardCheck, AlertTriangle } from "lucide-react";

export default function Assessments() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showAssessment, setShowAssessment] = useState(false);

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

  if (showAssessment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl py-8 px-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowAssessment(false)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Mental Wellness Screening
            </h1>
            <p className="text-muted-foreground mt-2">
              PHQ-9 + GAD-7 Combined Assessment
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Answer based on how you've felt over the past 2 weeks.
            </p>
          </div>

          <Card className="mb-6 bg-warning/10 border-warning/30">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                <p className="text-sm text-foreground/80">
                  This is a screening tool, not a diagnosis. Results are confidential and meant to help you understand your mental health. 
                  Always consult a professional for clinical advice.
                </p>
              </div>
            </CardContent>
          </Card>

          <AssessmentForm onComplete={() => setShowAssessment(false)} />
        </div>
      </div>
    );
  }

  return (
    <PageShell maxWidth="lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Self-Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Take a validated screening to better understand your mental health.
          </p>
        </div>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setShowAssessment(true)}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-info/20 to-primary/20 flex items-center justify-center mb-4 group-hover:from-info/30 group-hover:to-primary/30 transition-colors">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Mental Wellness Screening</CardTitle>
            <CardDescription>
              Combined PHQ-9 (Depression) + GAD-7 (Anxiety) assessment — clinically validated tools used worldwide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-info/10 rounded-lg">
                <p className="font-medium text-info text-sm">PHQ-9</p>
                <p className="text-xs text-info/80">Depression screening (9 questions)</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="font-medium text-primary text-sm">GAD-7</p>
                <p className="text-xs text-primary/80">Anxiety screening (7 questions)</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• 16 questions total</li>
              <li>• Takes about 5-7 minutes</li>
              <li>• Separate scores for depression and anxiety</li>
              <li>• Overall wellness risk assessment</li>
            </ul>
            <Button className="w-full">Start Assessment</Button>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">About This Assessment</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The <strong>PHQ-9</strong> (Patient Health Questionnaire) screens for depression symptoms, 
              while the <strong>GAD-7</strong> (Generalized Anxiety Disorder scale) screens for anxiety.
            </p>
            <p className="text-sm text-muted-foreground">
              Both are clinically validated and widely used in healthcare settings. They help identify 
              symptoms but are not a substitute for professional diagnosis. Your responses are stored 
              securely and can help track changes over time.
            </p>
          </CardContent>
        </Card>
    </PageShell>
  );
}
