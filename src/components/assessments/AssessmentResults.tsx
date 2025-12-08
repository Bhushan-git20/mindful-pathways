import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, ArrowLeft } from "lucide-react";
import { SeverityBand } from "@/data/assessmentQuestions";

interface AssessmentResultsProps {
  assessmentType: string;
  score: number;
  maxScore: number;
  severity: SeverityBand;
  interpretation: string;
  onBack: () => void;
  onViewDashboard: () => void;
}

const severityConfig: Record<SeverityBand, { color: string; icon: React.ReactNode; bgColor: string }> = {
  minimal: { 
    color: "text-green-600", 
    icon: <CheckCircle className="h-8 w-8" />,
    bgColor: "bg-green-50"
  },
  mild: { 
    color: "text-yellow-600", 
    icon: <Info className="h-8 w-8" />,
    bgColor: "bg-yellow-50"
  },
  moderate: { 
    color: "text-orange-600", 
    icon: <AlertTriangle className="h-8 w-8" />,
    bgColor: "bg-orange-50"
  },
  moderately_severe: { 
    color: "text-red-500", 
    icon: <AlertTriangle className="h-8 w-8" />,
    bgColor: "bg-red-50"
  },
  severe: { 
    color: "text-red-600", 
    icon: <AlertTriangle className="h-8 w-8" />,
    bgColor: "bg-red-50"
  }
};

export function AssessmentResults({ 
  assessmentType, 
  score, 
  maxScore, 
  severity, 
  interpretation,
  onBack,
  onViewDashboard
}: AssessmentResultsProps) {
  const config = severityConfig[severity];
  const severityLabel = severity.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className={`${config.bgColor} border-none`}>
        <CardHeader className="text-center pb-2">
          <div className={`mx-auto ${config.color} mb-2`}>{config.icon}</div>
          <CardTitle className="text-2xl">{assessmentType} Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-5xl font-bold text-foreground">{score}<span className="text-2xl text-muted-foreground">/{maxScore}</span></div>
          <p className={`text-xl font-semibold ${config.color}`}>{severityLabel}</p>
          <p className="text-muted-foreground">{interpretation}</p>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Important Disclaimer</p>
              <p className="text-sm text-amber-700 mt-1">
                This is a screening tool, not a clinical diagnosis. These results should not replace professional medical advice. 
                If you're experiencing distress, please reach out to a mental health professional or counselor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(severity === "moderate" || severity === "moderately_severe" || severity === "severe") && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Recommended Action</p>
                <p className="text-sm text-red-700 mt-1">
                  Based on your score, we recommend speaking with a counselor or mental health professional. 
                  Your campus counseling center can provide confidential support.
                </p>
                <p className="text-sm text-red-700 mt-2 font-medium">
                  Crisis Helpline: 988 (Suicide & Crisis Lifeline)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Take Another Assessment
        </Button>
        <Button onClick={onViewDashboard} className="flex-1">
          View Dashboard
        </Button>
      </div>
    </div>
  );
}
