import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentForm } from "@/components/assessments/AssessmentForm";
import AppHeader from "@/components/layout/AppHeader";
import { ArrowLeft, Brain, Heart, AlertTriangle } from "lucide-react";

type AssessmentType = "PHQ-9" | "GAD-7" | null;

export default function Assessments() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType>(null);

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

  if (selectedAssessment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl py-8 px-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedAssessment(null)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {selectedAssessment === "PHQ-9" ? "Depression Screening (PHQ-9)" : "Anxiety Screening (GAD-7)"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Answer honestly based on how you've felt over the past 2 weeks.
            </p>
          </div>

          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  This is a screening tool, not a diagnosis. Results are confidential and meant to help you understand your mental health. 
                  Always consult a professional for clinical advice.
                </p>
              </div>
            </CardContent>
          </Card>

          <AssessmentForm 
            type={selectedAssessment} 
            onComplete={() => setSelectedAssessment(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container max-w-4xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Self-Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Take a validated screening to better understand your mental health.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedAssessment("PHQ-9")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>PHQ-9 Depression Screening</CardTitle>
              <CardDescription>
                Patient Health Questionnaire - a validated tool to screen for depression symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 9 questions</li>
                <li>• Takes about 3-5 minutes</li>
                <li>• Measures depression severity</li>
              </ul>
              <Button className="w-full mt-4">Start PHQ-9</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedAssessment("GAD-7")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>GAD-7 Anxiety Screening</CardTitle>
              <CardDescription>
                Generalized Anxiety Disorder scale - a validated tool to screen for anxiety symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 7 questions</li>
                <li>• Takes about 2-3 minutes</li>
                <li>• Measures anxiety severity</li>
              </ul>
              <Button className="w-full mt-4">Start GAD-7</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">About These Assessments</h3>
            <p className="text-sm text-muted-foreground">
              The PHQ-9 and GAD-7 are widely used, clinically validated screening tools. 
              They help identify symptoms but are not a substitute for professional diagnosis. 
              Your responses are stored securely and can help track changes over time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
