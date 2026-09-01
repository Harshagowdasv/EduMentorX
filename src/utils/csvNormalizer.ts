import { Student, CSVRowValidationResult, Mentor } from '../types';

export const CANONICAL_CSV_HEADERS = [
  'USN',
  'Name',
  'Email',
  'Phone Number',
  'Parent Phone Number',
  'Date of Birth',
  'Gender',
  'Blood Group',
  'Address',
  'City',
  'State',
  'Pincode',
  'Emergency Contact Name',
  'Emergency Contact Phone',
  'Emergency Contact Relationship',
  'Department',
  'Program',
  'Year',
  'Semester',
  'Section',
  'Admission Year',
  'CGPA',
  'Attendance',
  'Financial Score',
  'Study Hours',
  'Previous Year Backlogs',
  'Current Backlogs',
  'Academic Status',
  'Career Goal',
  'Skills',
  'GitHub',
  'LeetCode',
  'HackerRank',
  'CodeChef',
  'LinkedIn',
  'Resume URL',
];

export function normalizeHeaderKey(rawKey: string): string {
  const clean = rawKey.trim().toLowerCase().replace(/[\s_\-]+/g, '');

  switch (clean) {
    case 'usn':
      return 'usn';
    case 'name':
    case 'studentname':
    case 'fullname':
      return 'name';
    case 'email':
    case 'studentemail':
    case 'emailaddress':
      return 'email';
    case 'phonenumber':
    case 'phone':
    case 'mobile':
    case 'studentphone':
      return 'phone';
    case 'parentphonenumber':
    case 'parentphone':
    case 'parentmobile':
    case 'guardianphone':
      return 'parentPhone';
    case 'dateofbirth':
    case 'dob':
    case 'birthdate':
      return 'dateOfBirth';
    case 'gender':
    case 'sex':
      return 'gender';
    case 'bloodgroup':
    case 'bloodtype':
      return 'bloodGroup';
    case 'address':
    case 'streetaddress':
      return 'address';
    case 'city':
      return 'city';
    case 'state':
      return 'state';
    case 'pincode':
    case 'zipcode':
    case 'postalcode':
      return 'pincode';
    case 'emergencycontactname':
    case 'emergencyname':
      return 'emergencyContactName';
    case 'emergencycontactphone':
    case 'emergencyphone':
      return 'emergencyContactPhone';
    case 'emergencycontactrelationship':
    case 'emergencyrelationship':
      return 'emergencyContactRelationship';
    case 'department':
    case 'dept':
    case 'branch':
      return 'department';
    case 'program':
    case 'course':
    case 'degree':
      return 'program';
    case 'year':
    case 'academicyear':
      return 'year';
    case 'semester':
    case 'sem':
      return 'semester';
    case 'section':
    case 'sec':
      return 'section';
    case 'admissionyear':
    case 'joiningyear':
      return 'admissionYear';
    case 'mentoremail':
    case 'mentor_email':
    case 'facultyemail':
      return 'mentorEmail';
    case 'mentorname':
    case 'mentor_name':
    case 'facultyname':
      return 'mentorName';
    case 'cgpa':
    case 'gpa':
    case 'marks':
      return 'cgpa';
    case 'attendance':
    case 'attendancepercentage':
      return 'attendance';
    case 'financialscore':
    case 'economicscore':
      return 'financialScore';
    case 'studyhours':
    case 'studyhoursperweek':
      return 'studyHours';
    case 'previousyearbacklogs':
    case 'prevbacklogs':
      return 'previousYearBacklogs';
    case 'currentbacklogs':
    case 'activebacklogs':
    case 'backlogs':
      return 'currentBacklogs';
    case 'academicstatus':
    case 'status':
      return 'academicStatus';
    case 'careergoal':
    case 'targetrole':
      return 'careerGoal';
    case 'skills':
    case 'technologies':
      return 'skills';
    case 'github':
    case 'githuburl':
    case 'githubprofile':
      return 'github';
    case 'leetcode':
    case 'leetcodeurl':
    case 'leetcodeprofile':
      return 'leetcode';
    case 'hackerrank':
    case 'hackerrankurl':
      return 'hackerrank';
    case 'codechef':
    case 'codechefurl':
      return 'codechef';
    case 'linkedin':
    case 'linkedinurl':
    case 'linkedinprofile':
      return 'linkedin';
    case 'resumeurl':
    case 'resumelink':
    case 'resume':
      return 'resumeUrl';
    case 'risklevel':
    case 'risk':
      return 'riskLevel';
    default:
      return rawKey.trim();
  }
}

export function parseNormalizedRow(rawRow: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  Object.keys(rawRow).forEach((key) => {
    if (key && rawRow[key] !== undefined && rawRow[key] !== null) {
      const normKey = normalizeHeaderKey(key);
      const val = typeof rawRow[key] === 'string' ? rawRow[key].trim() : rawRow[key];
      normalized[normKey] = val;
    }
  });
  return normalized;
}

export function validateAndMapCSVRow(
  rawRow: Record<string, any>,
  rowNumber: number,
  existingMentors: Mentor[],
  existingUSNs: Set<string>
): CSVRowValidationResult {
  const normalized = parseNormalizedRow(rawRow);
  const warnings: string[] = [];
  const errors: string[] = [];

  const usn = String(normalized.usn || '').trim().toUpperCase();
  const name = String(normalized.name || '').trim();
  const email = String(normalized.email || '').trim();
  const department = String(normalized.department || 'Computer Science & Engineering').trim();

  // 1. Required Student Master Data Checks
  if (!usn) errors.push('USN is missing or empty.');
  if (!name) errors.push('Student Name is missing or empty.');
  if (!email) {
    errors.push('Student Email is missing or empty.');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push(`Invalid email format: '${email}'.`);
  }

  // 2. Duplicate Check
  if (usn && existingUSNs.has(usn)) {
    warnings.push(`USN '${usn}' already exists in current database records.`);
  }

  // 3. Numeric Converters
  const cgpaVal = Math.min(10, Math.max(0, parseFloat(String(normalized.cgpa || '0')) || 0));
  const attendanceVal = Math.min(100, Math.max(0, parseFloat(String(normalized.attendance || '0')) || 0));
  const financialVal = Math.min(10, Math.max(1, parseInt(String(normalized.financialScore || '5'), 10) || 5));
  const studyHoursVal = Math.max(0, parseFloat(String(normalized.studyHours || '0')) || 0);
  const prevBacklogsVal = Math.max(0, parseInt(String(normalized.previousYearBacklogs || '0'), 10) || 0);
  const currBacklogsVal = Math.max(0, parseInt(String(normalized.currentBacklogs || normalized.backlogs || '0'), 10) || 0);

  // 4. Backward Compatibility Optional Mentor Matching (No errors if omitted!)
  let resolvedMentorId: string | null = null;
  let resolvedMentorName: string | undefined = undefined;

  const mentorEmail = String(normalized.mentorEmail || '').trim().toLowerCase();
  const mentorNameInput = String(normalized.mentorName || '').trim();

  if (mentorEmail) {
    const found = existingMentors.find((m) => m.email.toLowerCase() === mentorEmail);
    if (found) {
      resolvedMentorId = found.id;
      resolvedMentorName = found.name;
    }
  } else if (mentorNameInput) {
    const matches = existingMentors.filter((m) => m.name.toLowerCase() === mentorNameInput.toLowerCase());
    if (matches.length === 1) {
      resolvedMentorId = matches[0].id;
      resolvedMentorName = matches[0].name;
    }
  }

  // 5. Skills Array Parsing
  let skillsArray: string[] | undefined = undefined;
  if (normalized.skills) {
    if (Array.isArray(normalized.skills)) {
      skillsArray = normalized.skills;
    } else if (typeof normalized.skills === 'string') {
      skillsArray = normalized.skills.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const studentObj: Partial<Student> = {
    usn,
    name,
    email,
    phone: String(normalized.phone || '').trim(),
    parentPhone: String(normalized.parentPhone || '').trim(),
    dateOfBirth: normalized.dateOfBirth || undefined,
    gender: normalized.gender || undefined,
    bloodGroup: normalized.bloodGroup || undefined,
    address: normalized.address || undefined,
    city: normalized.city || undefined,
    state: normalized.state || undefined,
    pincode: normalized.pincode || undefined,
    department,
    program: normalized.program || 'B.Tech',
    year: normalized.year || '3rd Year',
    semester: normalized.semester || 'Semester 6',
    section: normalized.section || 'A',
    admissionYear: normalized.admissionYear || '2023',
    emergencyContactName: normalized.emergencyContactName || undefined,
    emergencyContactPhone: normalized.emergencyContactPhone || undefined,
    emergencyContactRelationship: normalized.emergencyContactRelationship || undefined,
    mentorId: resolvedMentorId,
    mentorName: resolvedMentorName,
    mentorEmail: mentorEmail || undefined,
    cgpa: cgpaVal,
    attendance: attendanceVal,
    financialScore: financialVal,
    studyHours: studyHoursVal,
    previousYearBacklogs: prevBacklogsVal,
    currentBacklogs: currBacklogsVal,
    academicStatus: normalized.academicStatus || 'Active',
    careerGoal: normalized.careerGoal || undefined,
    skills: skillsArray,
    github: normalized.github || undefined,
    leetcode: normalized.leetcode || undefined,
    hackerrank: normalized.hackerrank || undefined,
    codechef: normalized.codechef || undefined,
    linkedin: normalized.linkedin || undefined,
    resumeUrl: normalized.resumeUrl || undefined,
  };

  const isValid = errors.length === 0;
  const status = !isValid ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID';

  return {
    rowNumber,
    usn,
    name,
    email,
    department,
    isValid,
    status,
    warnings,
    errors,
    resolvedMentorId,
    resolvedMentorName,
    normalizedStudent: studentObj,
    rawData: rawRow,
  };
}
