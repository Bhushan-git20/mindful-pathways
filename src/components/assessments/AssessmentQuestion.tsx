import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RESPONSE_OPTIONS } from "@/data/assessmentQuestions";

interface AssessmentQuestionProps {
  questionNumber: number;
  question: string;
  value: number | null;
  onChange: (value: number) => void;
}

export function AssessmentQuestion({ questionNumber, question, value, onChange }: AssessmentQuestionProps) {
  return (
    <div className="p-6 bg-card rounded-xl border border-border/50 space-y-4">
      <p className="font-medium text-foreground">
        <span className="text-primary mr-2">{questionNumber}.</span>
        {question}
      </p>
      <p className="text-sm text-muted-foreground">Over the last 2 weeks, how often have you been bothered by this problem?</p>
      
      <RadioGroup
        value={value?.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2"
      >
        {RESPONSE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.value.toString()} 
              id={`q${questionNumber}-${option.value}`}
              className="border-primary"
            />
            <Label 
              htmlFor={`q${questionNumber}-${option.value}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
