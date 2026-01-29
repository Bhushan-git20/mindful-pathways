import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, ArrowLeft, Brain, Heart, Phone, Lightbulb } from "lucide-react";
import { CombinedAssessmentResult, SeverityBand } from "@/data/assessmentQuestions";

interface AssessmentResultsProps {
  result: CombinedAssessmentResult;
  onBack: () => void;
  onViewDashboard: () => void;
}

const severityConfig: Record<SeverityBand, { color: string; icon: React.ReactNode; bgColor: string; textColor: string }> = {
  minimal: { 
    color: "text-green-600", 
    icon: <CheckCircle className="h-5 w-5" />,
    bgColor: "bg-green-50",
    textColor: "text-green-700"
  },
  mild: { 
    color: "text-yellow-600", 
    icon: <Info className="h-5 w-5" />,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700"
  },
  moderate: { 
    color: "text-orange-600", 
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700"
  },
  moderately_severe: { 
    color: "text-red-500", 
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: "bg-red-50",
    textColor: "text-red-600"
  },
  severe: { 
    color: "text-red-600", 
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: "bg-red-50",
    textColor: "text-red-700"
  }
};

const riskConfig = {
  low: { color: "text-green-600", bgColor: "bg-green-100", label: "Low Risk" },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-100", label: "Moderate Risk" },
  high: { color: "text-red-600", bgColor: "bg-red-100", label: "High Risk" }
};

// Personalized recommendations based on dominant concern
const getPersonalizedRecommendations = (
  phq9Score: number, 
  gad7Score: number, 
  phq9MaxScore: number, 
  gad7MaxScore: number
) => {
  // Calculate normalized percentages
  const depressionPct = (phq9Score / phq9MaxScore) * 100;
  const anxietyPct = (gad7Score / gad7MaxScore) * 100;
  
  const dominantConcern = depressionPct > anxietyPct ? 'depression' : 
                          anxietyPct > depressionPct ? 'anxiety' : 'balanced';
  
  const depressionRecommendations = [
    "Behavioral activation: Schedule small, enjoyable activities daily (even a 10-minute walk)",
    "Social connection: Reach out to a friend or family member, even briefly",
    "Sleep hygiene: Maintain a consistent sleep schedule and limit screens before bed",
    "Physical activity: Light exercise can boost mood—aim for 20-30 minutes daily",
    "Mindful gratitude: Write down 3 things you're grateful for each day",
    "Break tasks into smaller steps to avoid feeling overwhelmed",
  ];
  
  const anxietyRecommendations = [
    "Deep breathing: Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s)",
    "Grounding techniques: Use the 5-4-3-2-1 method when feeling anxious",
    "Limit caffeine: Reduce coffee, energy drinks, and caffeinated sodas",
    "Progressive muscle relaxation: Tense and release muscle groups systematically",
    "Worry time: Set aside 15 minutes daily to address worries, then let them go",
    "Challenge catastrophic thinking: Ask 'What's the evidence? What's most likely?'",
  ];
  
  const balancedRecommendations = [
    "Establish a daily routine with consistent sleep, meals, and activity",
    "Practice mindfulness meditation for 10-15 minutes daily",
    "Regular exercise: Aim for 150 minutes of moderate activity per week",
    "Limit alcohol and substance use, which can worsen both conditions",
    "Connect with supportive people—isolation worsens both anxiety and depression",
    "Consider journaling to track patterns in your mood and worries",
  ];
  
  let primaryRecs: string[];
  let secondaryRecs: string[];
  let focusTitle: string;
  let focusDescription: string;
  let focusIcon: 'depression' | 'anxiety' | 'balanced';
  
  if (dominantConcern === 'depression') {
    primaryRecs = depressionRecommendations.slice(0, 4);
    secondaryRecs = anxietyRecommendations.slice(0, 2);
    focusTitle = "Focus: Managing Low Mood";
    focusDescription = "Your responses suggest depression symptoms are more prominent. These strategies target mood improvement.";
    focusIcon = 'depression';
  } else if (dominantConcern === 'anxiety') {
    primaryRecs = anxietyRecommendations.slice(0, 4);
    secondaryRecs = depressionRecommendations.slice(0, 2);
    focusTitle = "Focus: Managing Anxiety";
    focusDescription = "Your responses suggest anxiety symptoms are more prominent. These strategies target worry and tension.";
    focusIcon = 'anxiety';
  } else {
    primaryRecs = balancedRecommendations.slice(0, 4);
    secondaryRecs = [...depressionRecommendations.slice(0, 1), ...anxietyRecommendations.slice(0, 1)];
    focusTitle = "Balanced Approach";
    focusDescription = "Your responses show similar levels of depression and anxiety. These strategies address both.";
    focusIcon = 'balanced';
  }
  
  return {
    dominantConcern,
    focusTitle,
    focusDescription,
    focusIcon,
    primaryRecs,
    secondaryRecs,
  };
};

export function AssessmentResults({ 
  result,
  onBack,
  onViewDashboard
}: AssessmentResultsProps) {
  const phq9Config = severityConfig[result.phq9.band];
  const gad7Config = severityConfig[result.gad7.band];
  const overallConfig = riskConfig[result.overallRisk];
  
  const formatSeverity = (band: SeverityBand) => 
    band.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  const recommendations = getPersonalizedRecommendations(
    result.phq9.score,
    result.gad7.score,
    result.phq9.maxScore,
    result.gad7.maxScore
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Crisis Alert (if suicidal ideation detected) */}
      {result.hasSuicidalIdeation && (
        <Card className="bg-red-50 border-red-300 border-2">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Phone className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800 text-lg">Please Reach Out for Support</p>
                <p className="text-red-700 mt-1">
                  Your response indicates you may be having thoughts of self-harm. You're not alone, and help is available.
                </p>
                <div className="mt-3 space-y-2">
                  <p className="font-semibold text-red-800">Crisis Resources:</p>
                  <p className="text-red-700">• <strong>988</strong> - Suicide & Crisis Lifeline (call or text)</p>
                  <p className="text-red-700">• <strong>741741</strong> - Crisis Text Line (text HOME)</p>
                  <p className="text-red-700">• Campus Counseling Center - available during business hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Risk Summary */}
      <Card className={`${overallConfig.bgColor} border-none`}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Assessment Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <div className={`inline-block px-4 py-2 rounded-full ${overallConfig.bgColor}`}>
            <span className={`text-xl font-bold ${overallConfig.color}`}>{overallConfig.label}</span>
          </div>
          <p className="text-muted-foreground">{result.overallInterpretation}</p>
        </CardContent>
      </Card>

      {/* Subscale Results */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* PHQ-9 Results */}
        <Card className={`${phq9Config.bgColor} border-none`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Depression (PHQ-9)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{result.phq9.score}</span>
              <span className="text-muted-foreground">/ {result.phq9.maxScore}</span>
            </div>
            <div className={`flex items-center gap-2 ${phq9Config.color}`}>
              {phq9Config.icon}
              <span className="font-medium">{formatSeverity(result.phq9.band)}</span>
            </div>
            <p className={`text-sm ${phq9Config.textColor}`}>{result.phq9.interpretation}</p>
          </CardContent>
        </Card>

        {/* GAD-7 Results */}
        <Card className={`${gad7Config.bgColor} border-none`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Anxiety (GAD-7)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{result.gad7.score}</span>
              <span className="text-muted-foreground">/ {result.gad7.maxScore}</span>
            </div>
            <div className={`flex items-center gap-2 ${gad7Config.color}`}>
              {gad7Config.icon}
              <span className="font-medium">{formatSeverity(result.gad7.band)}</span>
            </div>
            <p className={`text-sm ${gad7Config.textColor}`}>{result.gad7.interpretation}</p>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Recommendations */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg text-indigo-900">{recommendations.focusTitle}</CardTitle>
          </div>
          <p className="text-sm text-indigo-700 mt-1">{recommendations.focusDescription}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-indigo-800 mb-2">Primary Strategies:</p>
            <ul className="space-y-2">
              {recommendations.primaryRecs.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-indigo-700">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          {recommendations.secondaryRecs.length > 0 && (
            <div>
              <p className="font-medium text-indigo-800 mb-2">Also Consider:</p>
              <ul className="space-y-2">
                {recommendations.secondaryRecs.map((rec, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-indigo-600">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
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

      {/* Recommended Action (for moderate+ scores) */}
      {result.requiresAttention && !result.hasSuicidalIdeation && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Recommended Next Steps</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Consider scheduling an appointment with your campus counseling center</li>
                  <li>• Practice self-care: sleep, exercise, and social connection</li>
                  <li>• Check out our Resources page for helpful articles and tips</li>
                  <li>• Retake this assessment in 2 weeks to track changes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
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
