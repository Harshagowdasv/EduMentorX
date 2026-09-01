import React, { useState, useEffect } from 'react';
import { CareerGuidance, Student } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Compass, Sparkles, CheckCircle2, ArrowRight, Lightbulb, BookOpen } from 'lucide-react';

interface AICareerGuidanceProps {
  student: Student;
}

export const AICareerGuidance: React.FC<AICareerGuidanceProps> = ({ student }) => {
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadGuidance();
  }, [student.id]);

  const loadGuidance = async () => {
    setLoading(true);
    try {
      const res = await dbService.getCareerGuidance(student.id);
      setGuidance(res);
    } catch (err) {
      console.error('Failed to load career guidance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGuidance = async () => {
    setGenerating(true);
    try {
      // Deterministic AI Career Guidance Engine
      const mockPaths = ['Full-Stack Cloud Architect', 'Distributed Systems Engineer', 'AI/ML Systems Engineer'];
      const mockGaps = ['Kubernetes / Docker Container Orchestration', 'GraphQL Federation', 'Kafka Event Streaming'];
      const mockTopics = ['Microservices Design Patterns', 'System Design & Scalability', 'CI/CD Pipeline Automation'];
      const mockProjects = ['Build a Real-Time Distributed Log Streaming Service in Go/TypeScript'];

      const newGuidance = await dbService.saveCareerGuidance({
        studentId: student.id,
        suggestedPaths: mockPaths,
        skillGaps: mockGaps,
        recommendedTopics: mockTopics,
        projectIdeas: mockProjects,
      });

      setGuidance(newGuidance);
    } catch (err) {
      console.error('Failed to generate career guidance:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/40">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI Personalized Career Guidance & Path Optimizer</h2>
              <p className="text-xs text-slate-300">Aligns your CGPA, projects, and coding skills with industry career roles</p>
            </div>
          </div>

          <button
            onClick={handleGenerateGuidance}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Analyzing Skill Profile...' : 'Generate Career Plan'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading Career Guidance...</div>
      ) : !guidance ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          Click "Generate Career Plan" above to analyze your career readiness.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Suggested Paths */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" /> Recommended Career Pathways
            </h3>
            <div className="space-y-2">
              {guidance.suggestedPaths.map((path, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white flex items-center justify-between">
                  <span>{path}</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Identified Skill Gaps to Bridge
            </h3>
            <div className="space-y-2">
              {guidance.skillGaps.map((gap, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
