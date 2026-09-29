import { useState, useEffect } from 'react';
import { Network, Search, Loader2, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import api from '../../../api';

interface PathNode {
  id: number;
  title: string;
  description: string;
  level: number;
  status: string;
  prerequisites: number[];
}

interface LearningPath {
  id: number;
  target_competency: { id: number; name: string };
  generated_at: string;
  nodes: PathNode[];
}

interface Competency {
  id: number;
  name: string;
}

export default function PathwaysIndex() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<number | ''>('');
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // In a real app we'd have a /api/core/competencies endpoint. 
    // Since we didn't expose one in Step 1, we can just hardcode the ones seeded 
    // or fetch from somewhere. Let's mock the list based on seed data.
    setCompetencies([
      { id: 1, name: 'Survey Design' },
      { id: 2, name: 'Sampling Techniques' },
      { id: 3, name: 'Data Collection & Fieldwork' },
      { id: 4, name: 'Data Cleaning & Validation' },
      { id: 5, name: 'SQL for Data Analysis' },
      { id: 6, name: 'Python for Statistics' },
      { id: 7, name: 'Data Visualisation' },
      { id: 8, name: 'Descriptive & Inferential Statistics' },
      { id: 9, name: 'NSS/MoSPI Standards & Procedures' },
      { id: 10, name: 'Official Statistics Dissemination' },
    ]);
  }, []);

  const handleGenerate = async () => {
    if (!selectedCompId) return;
    try {
      setGenerating(true);
      const res = await api.post('/pathways/paths/generate/', {
        competency_id: selectedCompId
      });
      setCurrentPath(res.data);
    } catch (err) {
      console.error('Failed to generate path', err);
      alert('Error generating path. Ensure the competency ID is valid.');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'in_progress': return <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
      default: return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  // Group nodes by level for DAG rendering
  const levels = Array.from(new Set(currentPath?.nodes.map(n => n.level) || [])).sort();

  return (
    <div className="p-8 max-w-7xl mx-auto font-jakarta">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Network className="w-8 h-8 text-primary" />
            Adaptive Learning Pathways
          </h1>
          <p className="text-gray-600 mt-2">
            AI-generated prerequisite graphs breaking down competencies into actionable micro-skills.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Target Competency</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(Number(e.target.value) || '')}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="">Select a competency...</option>
              {competencies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedCompId || generating}
          className="w-full md:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate DAG'}
        </button>
      </div>

      {currentPath && (
        <div className="bg-canvas border border-gray-200 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-primary to-purple-500"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Pathway: <span className="text-primary">{currentPath.target_competency.name}</span>
          </h2>

          <div className="flex flex-col gap-12 relative">
            {/* Draw a faint vertical connecting line in the background */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block"></div>
            
            {levels.map((level, idx) => {
              const nodesAtLevel = currentPath.nodes.filter(n => n.level === level);
              return (
                <div key={level} className="relative z-10">
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest shadow-sm">
                      Level {level}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    {nodesAtLevel.map(node => (
                      <div key={node.id} className="w-72 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-900 text-lg leading-tight">{node.title}</h4>
                          {getStatusIcon(node.status)}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{node.description}</p>
                        
                        {node.prerequisites.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Requires</span>
                            <div className="flex flex-wrap gap-1">
                              {node.prerequisites.map(prId => {
                                const pr = currentPath.nodes.find(n => n.id === prId);
                                return pr ? (
                                  <span key={prId} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                                    {pr.title}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {idx < levels.length - 1 && (
                    <div className="flex justify-center mt-8">
                      <ArrowRight className="w-6 h-6 text-gray-300 rotate-90 md:rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
