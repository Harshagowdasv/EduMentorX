import { AISafetyAssessment, AIChatMessage } from './interfaces/IAIService';
import { SafetySeverity } from '../types';

export function evaluateMessageSafety(
  message: string,
  history: AIChatMessage[] = []
): AISafetyAssessment {
  const lowerMsg = message.toLowerCase().trim();

  // 1. Explicit immediate danger patterns
  const immediateDangerPatterns = [
    /\b(end my life|kill myself|suicide|suicidal|want to die|going to die tonight|slash my wrists|take all my pills|goodbye forever|decided to end my life)\b/i,
    /\b(decided to end|plan to end|cannot go on living|goodbye world)\b/i,
  ];

  // 2. High concern hopeless/crisis intent patterns
  const highConcernPatterns = [
    /\b(don't see any point in continuing|no point in continuing|no point in living|better off dead|nobody cares if i die|want everything to stop|cannot take this pain anymore)\b/i,
    /\b(giving up on everything|don't want to wake up|disappear forever|worthless|no reason to live)\b/i,
  ];

  // 3. Normal academic/exam stress or casual emotion exemptions
  const casualExemptions = [
    /\b(stressed because my exams are|stressed about|exam stress|stressed for exam|stressed because of|exams coming|exams are coming|exams near|exams approaching|due date|scared of result|sad because i failed my exam|sad about grade|sad about mark|die of embarrassment|die laughing)\b/i,
  ];

  const isCasualExempt = casualExemptions.some((pattern) => pattern.test(lowerMsg));

  let severity: SafetySeverity = 'NORMAL';
  let reasoning = 'Standard academic / general conversation.';
  let contextSummary = 'Student inquiring about study, career, or general guidance.';

  if (!isCasualExempt) {
    if (immediateDangerPatterns.some((pattern) => pattern.test(lowerMsg))) {
      severity = 'IMMEDIATE_DANGER';
      reasoning = 'Detected explicit self-harm or suicidal intent requiring immediate crisis safety escalation.';
      contextSummary = `Student expressed urgent crisis intent: "${message.substring(0, 100)}"`;
    } else if (highConcernPatterns.some((pattern) => pattern.test(lowerMsg))) {
      severity = 'HIGH_CONCERN';
      reasoning = 'Detected severe emotional distress or hopelessness statements indicating self-harm risk.';
      contextSummary = `Student expressed high emotional concern: "${message.substring(0, 100)}"`;
    } else if (/\b(sad|depressed|lonely|overwhelmed|struggling|exhausted|stressed|stress)\b/i.test(lowerMsg)) {
      severity = 'LOW_CONCERN';
      reasoning = 'Student expressed normal academic pressure or general sadness without self-harm intent.';
      contextSummary = 'Student mentioned feeling overwhelmed or sad regarding general stress.';
    }
  } else {
    if (/\b(stressed|stress|sad|overwhelmed)\b/i.test(lowerMsg)) {
      severity = 'LOW_CONCERN';
      reasoning = 'Student expressed normal academic exam stress without self-harm risk.';
      contextSummary = 'Student mentioned feeling stressed about upcoming exams or coursework.';
    }
  }

  const isEscalated = severity === 'HIGH_CONCERN' || severity === 'IMMEDIATE_DANGER';

  let supportiveResponse = '';

  if (severity === 'IMMEDIATE_DANGER') {
    supportiveResponse =
      "I hear how deeply overwhelmed you are right now, and I care about your safety. You don't have to carry this heavy burden alone. Please reach out right now to someone who can help:\n\n" +
      "• **National Crisis Helpline**: Call or text **988** (or emergency line 112 / 911)\n" +
      "• **Student Support Helpline**: Available 24/7 for confidential counseling\n" +
      "• **Contact Your Faculty Mentor or Campus Health Center**\n\n" +
      "Please stay safe and talk to a trusted professional or family member right away. I am alerting human support resources so you receive compassionate care.";
  } else if (severity === 'HIGH_CONCERN') {
    supportiveResponse =
      "Thank you for sharing your feelings with me. It sounds like you are carrying a lot of weight right now. While I am an AI mentor, your well-being matters deeply. " +
      "I encourage you to reach out to your faculty mentor, a campus counselor, or a loved one. Sharing what you're going through with a trusted human can bring real clarity and relief.";
  } else if (severity === 'LOW_CONCERN') {
    supportiveResponse =
      "It is completely normal to feel stressed or tired when balancing academic responsibilities. Remember to take small breaks, stay hydrated, and break your work into manageable tasks. I'm right here to support your study plan!";
  } else {
    supportiveResponse = "I'm here to help you succeed in your academic and career journey! How can we tackle your goals today?";
  }

  return {
    severity,
    contextSummary,
    confidenceReasoning: reasoning,
    isEscalated,
    supportiveResponse,
  };
}
