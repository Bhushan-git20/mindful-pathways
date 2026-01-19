import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { AssessmentResults } from "./AssessmentResults";
import { 
  COMBINED_QUESTIONS,
  getCombinedAssessmentResult,
  getSectionTitle,
  getQuestionSection,
  CombinedAssessmentResult
} from "@/data/assessmentQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Loader2, Brain, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssessmentFormProps {
  onComplete: () => void;
}

export function AssessmentForm({ onComplete }: AssessmentFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const questions = COMBINED_QUESTIONS;
  
  const [responses, setResponses] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CombinedAssessmentResult | null>(null);

  const questionsPerPage = 4;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentStep * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
  const currentQuestions = questions.slice(startIndex, endIndex);

  const allCurrentAnswered = currentQuestions.every((_, i) => responses[startIndex + i] !== null);
  const allAnswered = responses.every(r => r !== null);
  const progress = (responses.filter(r => r !== null).length / questions.length) * 100;

  // Determine current section
  const currentSection = getQuestionSection(startIndex);
  const sectionTitle = getSectionTitle(startIndex);

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
    const assessmentResult = getCombinedAssessmentResult(responses);

    try {
      // Save combined assessment
      const { error } = await supabase.from("assessments").insert({
        user_id: user.id,
        assessment_type: "PHQ-9+GAD-7",
        responses: responses,
        total_score: assessmentResult.phq9.score + assessmentResult.gad7.score,
        severity: assessmentResult.overallRisk === "high" ? "severe" : 
                  assessmentResult.overallRisk === "medium" ? "moderate" : "minimal",
        interpretation: assessmentResult.overallInterpretation
      });

      if (error) throw error;

      // Also save to risk_scores for trend tracking
      await supabase.from("risk_scores").insert({
        user_id: user.id,
        overall_risk: assessmentResult.overallRisk,
        combined_score: assessmentResult.phq9.score + assessmentResult.gad7.score,
        assessment_component: {
          phq9_score: assessmentResult.phq9.score,
          phq9_severity: assessmentResult.phq9.band,
          gad7_score: assessmentResult.gad7.score,
          gad7_severity: assessmentResult.gad7.band,
          suicidal_ideation: assessmentResult.hasSuicidalIdeation
        }
      });

      setResult(assessmentResult);
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
        result={result}
        onBack={onComplete}
        onViewDashboard={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Section Header */}
      {sectionTitle && (
        <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg">
          {currentSection === "depression" ? (
            <Brain className="h-5 w-5 text-blue-600" />
          ) : (
            <Heart className="h-5 w-5 text-purple-600" />
          )}
          <span className="font-medium">{sectionTitle}</span>
          <Badge variant="outline" className={currentSection === "depression" ? "border-blue-200 text-blue-700" : "border-purple-200 text-purple-700"}>
            {currentSection === "depression" ? "9 questions" : "7 questions"}
          </Badge>
        </div>
      )}

      {/* Current section indicator (when not showing title) */}
      {!sectionTitle && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={currentSection === "depression" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}>
            {currentSection === "depression" ? "Depression (PHQ-9)" : "Anxiety (GAD-7)"}
          </Badge>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {currentQuestions.map((question, i) => (
          <AssessmentQuestion
            key={startIndex + i}
            questionNumber={startIndex + i + 1}
            question={question}
            value={responses[startIndex + i]}
            onChange={(value) => handleResponseChange(startIndex + i, value)}
            variant={getQuestionSection(startIndex + i)}
          />
        ))}
      </div>

      {/* Navigation */}
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
