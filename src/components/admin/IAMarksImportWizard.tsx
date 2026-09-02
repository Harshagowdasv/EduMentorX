import React, { useState, useEffect } from 'react';
import { AcademicYear, Semester, IAMarksImportResult } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import {
  FileSpreadsheet,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface IAMarksImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  actorId: string;
  onSuccess?: () => void;
}

interface ParsedPreviewRow {
  rowNumber: number;
  usn: string;
  name: string;
  academicYear: string;
  semester: string;
  subjectCode: string;
  subjectName: string;
  ia1: number;
  ia2: number;
  status: 'NEW' | 'UPDATE' | 'ERROR';
  reason?: string;
  rawData: Record<string, any>;
}

export const IAMarksImportWizard: React.FC<IAMarksImportWizardProps> = ({
  isOpen,
  onClose,
  actorId,
  onSuccess,
}) => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<ParsedPreviewRow[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<IAMarksImportResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCalendarData();
    }
  }, [isOpen]);

  const loadCalendarData = async () => {
    try {
      const [yearsList, semList] = await Promise.all([
        dbService.getAcademicYears(),
        dbService.getSemesters(),
      ]);
      setAcademicYears(yearsList);
      setSemesters(semList);

      const activeSem = semList.find((s) => s.isActive);
      if (activeSem) {
        setSelectedSemester(activeSem.name);
        const parentYear = yearsList.find((y) => y.id === activeSem.academicYearId);
        if (parentYear) setSelectedYear(parentYear.yearName);
      } else if (yearsList.length > 0) {
        setSelectedYear(yearsList[0].yearName);
        if (semList.length > 0) setSelectedSemester(semList[0].name);
      }
    } catch (err) {
      console.error('Failed to load academic calendar data:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setCsvText(content);
        analyzeCSV(content);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVToRows = (raw: string): Record<string, string>[] => {
    const lines = raw.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;
      
      const values = currentLine.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }
    return rows;
  };

  const analyzeCSV = async (content: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const rawRows = parseCSVToRows(content);
      const allStudents = await dbService.getStudents(1, 1000);
      const studentMap = new Map<string, string>();
      allStudents.students.forEach((s) => {
        studentMap.set(s.usn.trim().toUpperCase(), s.name);
      });

      const existingMarks = await dbService.getStudentAcademicMarks('all').catch(() => []);
      const markKeySet = new Set<string>();
      existingMarks.forEach((m) => {
        const key = `${m.studentUsn.trim().toUpperCase()}_${m.academicYear.trim()}_${m.semester.trim()}_${m.subjectCode.trim().toUpperCase()}`;
        markKeySet.add(key);
      });

      const parsed: ParsedPreviewRow[] = [];

      rawRows.forEach((row, idx) => {
        const rowNumber = idx + 1;
        const norm: Record<string, string> = {};
        Object.keys(row).forEach((k) => {
          norm[k.trim().toLowerCase().replace(/[\s_\-]+/g, '')] = row[k];
        });

        const usn = (norm.usn || '').trim().toUpperCase();
        const nameInput = (norm.studentname || norm.name || '').trim();
        const ay = (norm.academicyear || selectedYear || '').trim();
        const sem = (norm.semester || selectedSemester || '').trim();
        const subjectCode = (norm.subjectcode || norm.code || '').trim().toUpperCase();
        const subjectName = (norm.subjectname || norm.subject || '').trim();
        
        const ia1Val = parseFloat(norm.ia1marks || norm.ia1 || '0');
        const ia2Val = parseFloat(norm.ia2marks || norm.ia2 || '0');

        let status: 'NEW' | 'UPDATE' | 'ERROR' = 'NEW';
        let reason: string | undefined = undefined;

        if (!usn) {
          status = 'ERROR';
          reason = 'USN is required';
        } else if (!studentMap.has(usn)) {
          status = 'ERROR';
          reason = `USN '${usn}' not found in database`;
        } else if (!subjectCode) {
          status = 'ERROR';
          reason = 'Subject code is required';
        } else if (isNaN(ia1Val) || ia1Val < 0 || ia1Val > 100 || isNaN(ia2Val) || ia2Val < 0 || ia2Val > 100) {
          status = 'ERROR';
          reason = 'IA marks must be numbers between 0 and 100';
        } else {
          const compKey = `${usn}_${ay}_${sem}_${subjectCode}`;
          if (markKeySet.has(compKey)) {
            status = 'UPDATE';
          }
        }

        parsed.push({
          rowNumber,
          usn,
          name: nameInput || studentMap.get(usn) || 'Unknown Student',
          academicYear: ay,
          semester: sem,
          subjectCode,
          subjectName: subjectName || subjectCode,
          ia1: isNaN(ia1Val) ? 0 : ia1Val,
          ia2: isNaN(ia2Val) ? 0 : ia2Val,
          status,
          reason,
          rawData: row,
        });
      });

      setPreviewRows(parsed);
    } catch (err) {
      console.error('Failed to analyze CSV:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommitImport = async () => {
    if (previewRows.length === 0) return;
    setIsSubmitting(true);

    try {
      const rawRowsToCommit = previewRows.map((r) => r.rawData);
      const res = await dbService.importIAMarksCSV(rawRowsToCommit, selectedYear, selectedSemester, actorId);
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to import IA marks:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validNewCount = previewRows.filter((r) => r.status === 'NEW').length;
  const validUpdateCount = previewRows.filter((r) => r.status === 'UPDATE').length;
  const errorCount = previewRows.filter((r) => r.status === 'ERROR').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Internal Assessment (IA1 / IA2) Marks" maxWidth="4xl">
      <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto pr-1">
        {/* Step 1: Academic Year & Semester Selector */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-indigo-400" /> Target Academic Context
            </h4>
            <span className="text-[11px] text-slate-400">Defaulted to Active Term (supports historical archive selection)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Academic Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.yearName}>
                    {ay.yearName} {ay.isActive ? '(Active Year)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.name}>
                    {sem.name} {sem.isActive ? '(Active Semester)' : '(Archived)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: CSV File Upload or Paste */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2 text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Upload IA Marks CSV File
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Format: USN, Student Name, Academic Year, Semester, Subject Code, Subject Name, IA1 Marks, IA2 Marks
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer p-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl bg-slate-900/50 text-center transition">
              <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <span className="text-xs text-slate-300 font-medium">
                {fileName ? `Loaded: ${fileName}` : 'Click to select .csv file'}
              </span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">Or Paste Raw CSV Data:</label>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                analyzeCSV(e.target.value);
              }}
              placeholder={`USN,Student Name,Academic Year,Semester,Subject Code,Subject Name,IA1 Marks,IA2 Marks\n118CS21001,Aarav Sharma,2026-2027,Semester 6,CS601,Software Engineering,42,45\n118CS21001,Aarav Sharma,2026-2027,Semester 6,CS602,Compiler Design,38,40`}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Step 3: Analysis & Preview Table */}
        {previewRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  Total: {previewRows.length} Rows
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> New: {validNewCount}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Updates: {validUpdateCount}
                </span>
                {errorCount > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-rose-950 text-rose-300 border border-rose-800 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Errors: {errorCount}
                  </span>
                )}
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-60">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">USN</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5">IA1</th>
                    <th className="p-2.5">IA2</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono text-slate-300">
                  {previewRows.map((r) => (
                    <tr key={r.rowNumber} className={r.status === 'ERROR' ? 'bg-rose-950/20' : 'hover:bg-slate-900/40'}>
                      <td className="p-2.5 text-slate-500">{r.rowNumber}</td>
                      <td className="p-2.5 font-bold text-white">{r.usn || '-'}</td>
                      <td className="p-2.5 text-slate-300">{r.name}</td>
                      <td className="p-2.5 text-slate-300">{r.subjectCode} ({r.subjectName})</td>
                      <td className="p-2.5 text-indigo-400 font-bold">{r.ia1}</td>
                      <td className="p-2.5 text-indigo-400 font-bold">{r.ia2}</td>
                      <td className="p-2.5">
                        {r.status === 'NEW' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            NEW
                          </span>
                        )}
                        {r.status === 'UPDATE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            UPDATE
                          </span>
                        )}
                        {r.status === 'ERROR' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold" title={r.reason}>
                            ERROR: {r.reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Import Execution Result Feedback */}
        {result && (
          <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Import Execution Summary
            </h4>
            <p className="text-slate-300">
              Successfully processed {result.totalRows} rows: <strong className="text-emerald-400">{result.importedCount} new</strong> records created, <strong className="text-amber-400">{result.updatedCount} existing</strong> records updated, <strong className="text-rose-400">{result.failedCount} errors</strong>.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && previewRows.length > 0 && (
            <button
              onClick={handleCommitImport}
              disabled={isSubmitting || validNewCount + validUpdateCount === 0}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? 'Importing Marks...' : `Commit Import (${validNewCount + validUpdateCount} Records)`}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
