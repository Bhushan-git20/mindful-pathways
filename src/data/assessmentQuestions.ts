// PHQ-9 Questions (Depression Screening)
// Reference: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.
export const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
];

// GAD-7 Questions (Anxiety Screening)
// Reference: Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.
export const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

// Combined PHQ-9 + GAD-7 = 16 questions total
export const COMBINED_QUESTIONS = [
  // PHQ-9 (indices 0-8)
  ...PHQ9_QUESTIONS,
  // GAD-7 (indices 9-15)
  ...GAD7_QUESTIONS
];

// Standard response options (same for both instruments)
// 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day
export const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

export type SeverityBand = "minimal" | "mild" | "moderate" | "moderately_severe" | "severe";

export type RiskLevel = "low" | "medium" | "high";

export interface ScoreResult {
  band: SeverityBand;
  interpretation: string;
  score: number;
  maxScore: number;
}

export interface CombinedAssessmentResult {
  phq9: ScoreResult;
  gad7: ScoreResult;
  overallRisk: RiskLevel;
  overallInterpretation: string;
  requiresAttention: boolean;
  hasSuicidalIdeation: boolean;
}

/**
 * PHQ-9 Scoring Algorithm
 * Score Range: 0-27
 * Cutoffs per Kroenke et al. (2001):
 * - 0-4: Minimal depression
 * - 5-9: Mild depression
 * - 10-14: Moderate depression
 * - 15-19: Moderately severe depression
 * - 20-27: Severe depression
 * 
 * Note: Question 9 (suicidal ideation) requires special attention regardless of score
 */
export const getPHQ9Severity = (score: number): ScoreResult => {
  if (score <= 4) {
    return { 
      band: "minimal", 
      interpretation: "Minimal depression. Your symptoms suggest you're doing well. Continue with self-care and healthy habits.",
      score,
      maxScore: 27
    };
  }
  if (score <= 9) {
    return { 
      band: "mild", 
      interpretation: "Mild depression. Consider monitoring symptoms and practicing self-care. Reach out if symptoms persist or worsen.",
      score,
      maxScore: 27
    };
  }
  if (score <= 14) {
    return { 
      band: "moderate", 
      interpretation: "Moderate depression. Consider speaking with a counselor. Treatment may include therapy, lifestyle changes, or medication.",
      score,
      maxScore: 27
    };
  }
  if (score <= 19) {
    return { 
      band: "moderately_severe", 
      interpretation: "Moderately severe depression. Active treatment is recommended. Please consider scheduling an appointment with a mental health professional.",
      score,
      maxScore: 27
    };
  }
  return { 
    band: "severe", 
    interpretation: "Severe depression. Prompt professional treatment is strongly recommended. Medication and/or intensive therapy may be beneficial.",
    score,
    maxScore: 27
  };
};

/**
 * GAD-7 Scoring Algorithm
 * Score Range: 0-21
 * Cutoffs per Spitzer et al. (2006):
 * - 0-4: Minimal anxiety
 * - 5-9: Mild anxiety
 * - 10-14: Moderate anxiety
 * - 15-21: Severe anxiety
 */
export const getGAD7Severity = (score: number): ScoreResult => {
  if (score <= 4) {
    return { 
      band: "minimal", 
      interpretation: "Minimal anxiety. Your anxiety levels appear within normal range. Keep up healthy coping strategies.",
      score,
      maxScore: 21
    };
  }
  if (score <= 9) {
    return { 
      band: "mild", 
      interpretation: "Mild anxiety. Monitor your symptoms and practice relaxation techniques. Consider talking to someone if symptoms persist.",
      score,
      maxScore: 21
    };
  }
  if (score <= 14) {
    return { 
      band: "moderate", 
      interpretation: "Moderate anxiety. Consider speaking with a counselor. Evidence-based treatments like CBT can be very effective.",
      score,
      maxScore: 21
    };
  }
  return { 
    band: "severe", 
    interpretation: "Severe anxiety. Professional evaluation is strongly recommended. Treatment options include therapy and/or medication.",
    score,
    maxScore: 21
  };
};

/**
 * Combined Assessment Algorithm
 * Analyzes both PHQ-9 and GAD-7 responses together
 * 
 * @param responses - Array of 16 responses (0-8 = PHQ-9, 9-15 = GAD-7)
 * @returns Combined assessment result with both subscale scores and overall risk
 */
export const getCombinedAssessmentResult = (responses: (number | null)[]): CombinedAssessmentResult => {
  // Calculate PHQ-9 score (first 9 questions)
  const phq9Responses = responses.slice(0, 9);
  const phq9Score = phq9Responses.reduce((sum, val) => sum + (val || 0), 0);
  const phq9Result = getPHQ9Severity(phq9Score);
  
  // Calculate GAD-7 score (questions 10-16)
  const gad7Responses = responses.slice(9, 16);
  const gad7Score = gad7Responses.reduce((sum, val) => sum + (val || 0), 0);
  const gad7Result = getGAD7Severity(gad7Score);
  
  // Check for suicidal ideation (PHQ-9 Question 9, index 8)
  const suicidalIdeationResponse = responses[8] || 0;
  const hasSuicidalIdeation = suicidalIdeationResponse > 0;
  
  // Determine overall risk level
  let overallRisk: RiskLevel = "low";
  let overallInterpretation = "";
  let requiresAttention = false;
  
  // High risk conditions
  if (
    hasSuicidalIdeation ||
    phq9Result.band === "severe" ||
    phq9Result.band === "moderately_severe" ||
    gad7Result.band === "severe"
  ) {
    overallRisk = "high";
    requiresAttention = true;
    
    if (hasSuicidalIdeation) {
      overallInterpretation = "Your responses indicate thoughts of self-harm. Please reach out to a counselor or crisis line immediately. You don't have to face this alone.";
    } else {
      overallInterpretation = "Your responses indicate significant symptoms that would benefit from professional support. We recommend connecting with a mental health professional.";
    }
  }
  // Medium risk conditions
  else if (
    phq9Result.band === "moderate" ||
    gad7Result.band === "moderate" ||
    (phq9Result.band === "mild" && gad7Result.band === "mild")
  ) {
    overallRisk = "medium";
    requiresAttention = true;
    overallInterpretation = "Your responses suggest some symptoms worth monitoring. Consider speaking with a counselor, especially if symptoms persist.";
  }
  // Low risk
  else {
    overallRisk = "low";
    overallInterpretation = "Your responses suggest you're managing well overall. Continue with healthy self-care practices.";
  }
  
  return {
    phq9: phq9Result,
    gad7: gad7Result,
    overallRisk,
    overallInterpretation,
    requiresAttention,
    hasSuicidalIdeation
  };
};

/**
 * Get section label for question index in combined assessment
 */
export const getQuestionSection = (index: number): "depression" | "anxiety" => {
  return index < 9 ? "depression" : "anxiety";
};

/**
 * Get section title based on question index
 */
export const getSectionTitle = (index: number): string => {
  if (index === 0) return "Depression Screening (PHQ-9)";
  if (index === 9) return "Anxiety Screening (GAD-7)";
  return "";
};
