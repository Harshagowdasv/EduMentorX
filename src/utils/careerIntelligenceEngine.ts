import { Student, StudentPortfolio, SkillGapItem, PlacementReadinessStatus } from '../types';

export interface RoleSkillBenchmark {
  role: string;
  domain: string;
  essentialSkills: string[];
  recommendedSkills: string[];
  optionalSkills: string[];
  recommendedTopics: string[];
  projectIdeas: string[];
  recommendedCertifications: string[];
}

export const ROLE_BENCHMARKS: Record<string, RoleSkillBenchmark> = {
  'Full-Stack Developer': {
    role: 'Full-Stack Developer',
    domain: 'Software & Web Engineering',
    essentialSkills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'SQL / PostgreSQL / MongoDB', 'Git'],
    recommendedSkills: ['Docker', 'GraphQL', 'Tailwind CSS', 'CI/CD Pipelines', 'Unit Testing'],
    optionalSkills: ['AWS / Cloud Deployment', 'Next.js', 'Redis'],
    recommendedTopics: ['RESTful API Architecture', 'React State Management & Performance', 'Database Indexing & Query Optimization'],
    projectIdeas: ['Build a Full-Stack E-Commerce or SaaS Dashboard with Authentication', 'Build a Real-Time Collaborative Task Workspace in React & Node.js'],
    recommendedCertifications: ['AWS Certified Developer - Associate', 'Meta Front-End / Back-End Developer Certificate'],
  },
  'Data Analyst / Data Scientist': {
    role: 'Data Analyst / Data Scientist',
    domain: 'Data & Analytics',
    essentialSkills: ['Python', 'SQL', 'Pandas / NumPy', 'Data Visualization', 'Statistics & Probability'],
    recommendedSkills: ['Machine Learning', 'Power BI / Tableau', 'Scikit-Learn', 'A/B Testing'],
    optionalSkills: ['Deep Learning', 'PyTorch / TensorFlow', 'BigData / Spark'],
    recommendedTopics: ['Exploratory Data Analysis (EDA)', 'SQL Aggregations & Window Functions', 'Predictive Modeling & Regression'],
    projectIdeas: ['Perform End-to-End Customer Churn Analytics Dashboard', 'Build a Sales Forecasting ML Model using Python & Streamlit'],
    recommendedCertifications: ['Google Data Analytics Professional Certificate', 'Microsoft Certified: Power BI Data Analyst'],
  },
  'AI / ML Engineer': {
    role: 'AI / ML Engineer',
    domain: 'Artificial Intelligence & Machine Learning',
    essentialSkills: ['Python', 'PyTorch / TensorFlow', 'Machine Learning', 'Linear Algebra & Calculus', 'Git'],
    recommendedSkills: ['NLP / LLM Integration', 'Computer Vision', 'Scikit-Learn', 'API Model Deployment'],
    optionalSkills: ['CUDA Optimization', 'MLOps / MLflow', 'Vector Databases (Chroma / Pinecone)'],
    recommendedTopics: ['Deep Learning Architectures (Transformers & CNNs)', 'Model Quantization & Inference Optimization', 'Feature Engineering'],
    projectIdeas: ['Build a RAG AI Document Search Assistant using LLM APIs & Vector Search', 'Train an Image Classification Pipeline with PyTorch'],
    recommendedCertifications: ['AWS Certified Machine Learning - Specialty', 'TensorFlow Developer Certificate'],
  },
  'Cloud / DevOps Engineer': {
    role: 'Cloud / DevOps Engineer',
    domain: 'Cloud Infrastructure & Security',
    essentialSkills: ['Linux / Bash', 'Docker', 'Kubernetes', 'AWS / Azure', 'Git'],
    recommendedSkills: ['Terraform', 'CI/CD Pipelines (GitHub Actions / Jenkins)', 'Networking & Security', 'Python / Go'],
    optionalSkills: ['Ansible', 'Prometheus / Grafana Monitoring', 'Helm'],
    recommendedTopics: ['Infrastructure as Code (IaC) with Terraform', 'Container Orchestration & Kubernetes Ingress', 'Automated Deployment Pipelines'],
    projectIdeas: ['Deploy a Multi-Stage CI/CD Pipeline for Microservices on Kubernetes', 'Automate Cloud Infrastructure Provisioning with Terraform'],
    recommendedCertifications: ['AWS Certified Solutions Architect - Associate', 'Certified Kubernetes Administrator (CKA)'],
  },
  'Mobile Application Developer': {
    role: 'Mobile Application Developer',
    domain: 'Mobile Software Engineering',
    essentialSkills: ['Flutter / React Native', 'Dart / JavaScript / Swift', 'Mobile UI Design', 'REST APIs'],
    recommendedSkills: ['State Management (Redux / Provider / Bloc)', 'Firebase Integration', 'Mobile Database (SQLite / Hive)'],
    optionalSkills: ['Native iOS / Android', 'Push Notifications', 'App Store / Play Store Deployment'],
    recommendedTopics: ['Cross-Platform App Lifecycle', 'Offline Data Synchronization', 'Mobile Performance & Memory Optimization'],
    projectIdeas: ['Build a Mobile Fitness Tracking App with Firebase Sync & Offline Support', 'Build a Cross-Platform E-Commerce Shopping App'],
    recommendedCertifications: ['Google Associate Android Developer', 'Meta Native Mobile Developer'],
  },
  'Software Engineer (General)': {
    role: 'Software Engineer (General)',
    domain: 'Core Software Development',
    essentialSkills: ['Data Structures & Algorithms', 'System Design', 'Object Oriented Programming', 'Git'],
    recommendedSkills: ['SQL / Databases', 'Unit Testing', 'Design Patterns', 'Python / Java / C++'],
    optionalSkills: ['Cloud Basics', 'Docker', 'Microservices'],
    recommendedTopics: ['Algorithm Complexity & LeetCode Patterns', 'System Scalability & Load Balancing', 'Clean Code Principles'],
    projectIdeas: ['Implement a High-Performance In-Memory Cache in C++/Go/Java', 'Build a RESTful API Web Application with Test Suite'],
    recommendedCertifications: ['Oracle Certified Professional Java SE', 'AWS Certified Developer'],
  },
};

/**
 * Deterministic Skill Gap Analysis Engine
 */
export function analyzeSkillGaps(currentSkills: string[] = [], targetRole = 'Full-Stack Developer') {
  const benchmark = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Software Engineer (General)'];
  const normalizedCurrent = currentSkills.map((s) => s.toLowerCase().trim());

  const skillDetails: SkillGapItem[] = [];
  const strongSkills: string[] = [];
  const missingSkills: string[] = [];
  const improvingSkills: string[] = [];

  // Evaluate Essential Skills
  benchmark.essentialSkills.forEach((skill) => {
    const hasSkill = normalizedCurrent.some((s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
    if (hasSkill) {
      strongSkills.push(skill);
      skillDetails.push({ skill, category: 'strong', priority: 'CRITICAL' });
    } else {
      missingSkills.push(skill);
      skillDetails.push({ skill, category: 'missing', priority: 'CRITICAL' });
    }
  });

  // Evaluate Recommended Skills
  benchmark.recommendedSkills.forEach((skill) => {
    const hasSkill = normalizedCurrent.some((s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
    if (hasSkill) {
      improvingSkills.push(skill);
      skillDetails.push({ skill, category: 'needs_improvement', priority: 'RECOMMENDED' });
    } else {
      missingSkills.push(skill);
      skillDetails.push({ skill, category: 'missing', priority: 'RECOMMENDED' });
    }
  });

  // Evaluate Optional Skills
  benchmark.optionalSkills.forEach((skill) => {
    const hasSkill = normalizedCurrent.some((s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
    if (hasSkill) {
      improvingSkills.push(skill);
      skillDetails.push({ skill, category: 'needs_improvement', priority: 'OPTIONAL' });
    } else {
      skillDetails.push({ skill, category: 'missing', priority: 'OPTIONAL' });
    }
  });

  return {
    benchmark,
    strongSkills,
    missingSkills,
    improvingSkills,
    skillDetails,
  };
}

/**
 * Transparent, Explainable Placement Readiness Calculator
 */
export function calculatePlacementReadiness(
  student: Partial<Student>,
  portfolio: StudentPortfolio | null,
  targetRole = 'Full-Stack Developer'
): {
  score: number;
  status: PlacementReadinessStatus;
  reasons: string[];
} {
  const cgpa = Number(student.cgpa || 0);
  const backlogs = Number(student.previousYearBacklogs || 0) + Number(student.currentBacklogs || 0);
  const skills = student.skills || [];
  const projects = portfolio?.projects || [];
  const hasGithub = Boolean(student.github || portfolio?.codingProfiles?.github);
  const hasLeetcode = Boolean(student.leetcode || portfolio?.codingProfiles?.leetcode || portfolio?.codingProfiles?.linkedin);
  const hasResume = Boolean(portfolio?.resumeUrl || portfolio?.resumeName);

  const reasons: string[] = [];

  // Check profile data completeness first
  const dataPointsCount =
    (skills.length > 0 ? 1 : 0) +
    (projects.length > 0 ? 1 : 0) +
    (hasGithub || hasLeetcode ? 1 : 0) +
    (hasResume ? 1 : 0) +
    (cgpa > 0 ? 1 : 0);

  if (dataPointsCount < 2) {
    return {
      score: 0,
      status: 'INSUFFICIENT_DATA',
      reasons: [
        'Insufficient student profile data to compute placement readiness.',
        'Please add skills, technical projects, or portfolio links to unlock readiness assessment.',
      ],
    };
  }

  let totalScore = 0;

  // 1. Academic Performance (Max 25 pts)
  if (cgpa >= 8.0) {
    totalScore += 25;
    reasons.push(`Strong academic standing with CGPA ${cgpa.toFixed(2)} (+25 pts).`);
  } else if (cgpa >= 7.0) {
    totalScore += 20;
    reasons.push(`Satisfactory academic standing with CGPA ${cgpa.toFixed(2)} (+20 pts).`);
  } else if (cgpa >= 6.5) {
    totalScore += 15;
    reasons.push(`Academic CGPA of ${cgpa.toFixed(2)} meets minimum placement eligibility (+15 pts).`);
  } else if (cgpa > 0) {
    totalScore += 5;
    reasons.push(`Academic CGPA of ${cgpa.toFixed(2)} is below benchmark requirement (+5 pts).`);
  }

  if (backlogs > 0) {
    totalScore = Math.max(0, totalScore - 10);
    reasons.push(`Has ${backlogs} active backlogs (-10 pts penalty).`);
  }

  // 2. Technical Skill Alignment (Max 35 pts)
  const { benchmark, strongSkills, missingSkills } = analyzeSkillGaps(skills, targetRole);
  const essentialCount = benchmark.essentialSkills.length;
  const matchedEssentialCount = strongSkills.length;

  const skillScore = Math.round((matchedEssentialCount / essentialCount) * 35);
  totalScore += skillScore;
  reasons.push(
    `Matches ${matchedEssentialCount} of ${essentialCount} essential skills for ${targetRole} (+${skillScore}/35 pts).`
  );

  // 3. Technical Projects (Max 20 pts)
  const validProjects = projects.filter((p) => p.title && (p.githubUrl || p.liveUrl || p.description));
  if (validProjects.length >= 2) {
    totalScore += 20;
    reasons.push(`Has ${validProjects.length} technical projects with repository/demo links (+20 pts).`);
  } else if (validProjects.length === 1) {
    totalScore += 10;
    reasons.push(`Has 1 technical project (+10 pts). Adding a 2nd project is recommended.`);
  } else {
    reasons.push(`No technical projects added to portfolio (0/20 pts).`);
  }

  // 4. Professional & Coding Profiles (Max 10 pts)
  if (hasGithub && hasLeetcode) {
    totalScore += 10;
    reasons.push(`Active GitHub and coding/LinkedIn profiles verified (+10 pts).`);
  } else if (hasGithub || hasLeetcode) {
    totalScore += 5;
    reasons.push(`Has 1 coding/professional profile linked (+5 pts).`);
  } else {
    reasons.push(`No GitHub or coding profiles linked (0/10 pts).`);
  }

  // 5. Resume (Max 10 pts)
  if (hasResume) {
    totalScore += 10;
    reasons.push(`Uploaded student resume verified (+10 pts).`);
  } else {
    reasons.push(`No resume uploaded to portfolio (0/10 pts).`);
  }

  totalScore = Math.min(100, Math.max(0, totalScore));

  let status: PlacementReadinessStatus = 'EARLY_STAGE';
  if (totalScore >= 75 && backlogs === 0) {
    status = 'PLACEMENT_READY';
  } else if (totalScore >= 50) {
    status = 'INTERMEDIATE';
  } else {
    status = 'EARLY_STAGE';
  }

  return {
    score: totalScore,
    status,
    reasons,
  };
}
