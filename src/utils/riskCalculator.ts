import { Student, RiskLevel, ExplainableRisk } from '../types';

export function calculateExplainableRisk(student: Partial<Student>): ExplainableRisk {
  const cgpa = Number(student.cgpa || 0);
  const attendance = Number(student.attendance || 0);
  const backlogs = Number(student.previousYearBacklogs || 0);
  const studyHours = Number(student.studyHours || 0);
  const financialScore = Number(student.financialScore || 5);
  
  const reasons: string[] = [];
  let riskScore = 0;

  // CGPA scoring & reasons
  if (cgpa >= 8.0) {
    reasons.push(`Strong academic standing with CGPA of ${cgpa.toFixed(2)} (Target >= 8.0).`);
  } else if (cgpa >= 6.5) {
    reasons.push(`Moderate academic standing with CGPA of ${cgpa.toFixed(2)}.`);
    riskScore += 1;
  } else {
    reasons.push(`CGPA of ${cgpa.toFixed(2)} is below the target benchmark of 6.50.`);
    riskScore += 3;
  }

  // Attendance scoring & reasons
  if (attendance >= 85) {
    reasons.push(`High lecture attendance rate at ${attendance}%.`);
  } else if (attendance >= 75) {
    reasons.push(`Satisfactory attendance at ${attendance}%.`);
    riskScore += 1;
  } else {
    reasons.push(`Critical attendance deficit at ${attendance}% (Minimum requirement is 75%).`);
    riskScore += 3;
  }

  // Backlogs scoring & reasons
  if (backlogs > 0) {
    reasons.push(`Has ${backlogs} active/previous backlogs requiring targeted clearing strategy.`);
    riskScore += backlogs * 2;
  } else {
    reasons.push(`Zero active academic backlogs.`);
  }

  // Study hours scoring & reasons
  if (studyHours < 8) {
    reasons.push(`Weekly self-study commitment of ${studyHours} hours is below recommended 12+ hours.`);
    riskScore += 2;
  } else if (studyHours >= 15) {
    reasons.push(`Consistently high weekly self-study discipline (${studyHours} hours/week).`);
  }

  // Financial / Support indicator (financial score 1 = high financial stress/need)
  if (financialScore <= 3) {
    reasons.push(`Elevated institutional financial assistance indicator (Level ${financialScore}/10).`);
    riskScore += 1;
  }

  let status: RiskLevel = 'GOOD_PERFORMANCE';
  if (riskScore >= 5 || backlogs >= 2 || (cgpa < 6.0 && attendance < 75)) {
    status = 'HIGH_PRIORITY';
  } else if (riskScore >= 2 || backlogs === 1 || cgpa < 7.0 || attendance < 80) {
    status = 'NEEDS_MONITORING';
  }

  // Compute sub-trends
  const cgpaTrend = cgpa >= 7.5 ? 'improving' : cgpa >= 6.5 ? 'stable' : 'declining';
  const attendanceTrend = attendance >= 80 ? 'improving' : attendance >= 75 ? 'stable' : 'declining';

  return {
    status,
    reasons,
    cgpaTrend,
    attendanceTrend,
    contributingFactors: {
      cgpaScore: cgpa,
      attendanceScore: attendance,
      backlogsCount: backlogs,
      studyHoursPerWeek: studyHours,
      financialScore: financialScore,
      recencyScore: student.lastInteractionDate ? calculateDaysSince(student.lastInteractionDate) : 0,
    }
  };
}

function calculateDaysSince(dateString: string): number {
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
