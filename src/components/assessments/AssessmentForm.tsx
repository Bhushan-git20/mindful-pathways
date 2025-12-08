import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { AssessmentResults } from "./AssessmentResults";
import { 
  PHQ9_QUESTIONS, 
  GAD7_QUESTIONS, 
  getPHQ9Severity, 
  getGAD7Severity,
  SeverityBand 
} from "@/data/assessmentQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssessmentFormProps {
  type: "PHQ-9" | "GAD-7";
  onComplete: () => void;
}

export function AssessmentForm({ type, onComplete }: AssessmentFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const questions = type === "PHQ-9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const maxScore = type === "PHQ-9" ? 27 : 21;
  
  const [responses, setResponses] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; severity: SeverityBand; interpretation: string } | null>(null);

  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentStep * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
  const currentQuestions = questions.slice(startIndex, endIndex);

  const allCurrentAnswered = currentQuestions.every((_, i) => responses[startIndex + i] !== null);
  const allAnswered = responses.every(r => r !== null);
  const progress = (responses.filter(r => r !== null).length / questions.length) * 100;

  const handleResponseChange = (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentStep < totalPages - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!user || !allAnswered) return;

    setIsSubmitting(true);
    const totalScore = responses.reduce((sum, val) => sum + (val || 0), 0);
    const { band, interpretation } = type === "PHQ-9" 
      ? getPHQ9Severity(totalScore) 
      : getGAD7Severity(totalScore);

    try {
      const { error } = await supabase.from("assessments").insert({
        user_id: user.id,
        assessment_type: type,
        responses: responses,
        total_score: totalScore,
        severity: band,
        interpretation: interpretation
      });

      if (error) throw error;

      setResult({ score: totalScore, severity: band, interpretation });
      toast({
        title: "Assessment Completed",
        description: "Your responses have been saved securely."
      });
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <AssessmentResults
        assessmentType={type}
        score={result.score}
        maxScore={maxScore}
        severity={result.severity}
        interpretation={result.interpretation}
        onBack={onComplete}
        onViewDashboard={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4">
        {currentQuestions.map((question, i) => (
          <AssessmentQuestion
            key={startIndex + i}
            questionNumber={startIndex + i + 1}
            question={question}
            value={responses[startIndex + i]}
            onChange={(value) => handleResponseChange(startIndex + i, value)}
          />
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < totalPages - 1 ? (
          <Button onClick={handleNext} disabled={!allCurrentAnswered}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!allAnswered || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Assessment"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
