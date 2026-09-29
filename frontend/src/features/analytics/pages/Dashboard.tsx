import { useState, useEffect } from 'react';
import { Target, Award, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import api from '../../../api';

interface RadarData {
  competency_id: number;
  competency_name: string;
  domain: string;
  target_level: number;
  current_level: number;
  gap: number;
}

interface RadarResponse {
  role: string;
  radar_data: RadarData[];
  error?: string;
}

interface ActivityDay {
  date: string;
  count: number;
}

export default function AnalyticsDashboard() {
  const [radarResponse, setRadarResponse] = useState<RadarResponse | null>(null);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [radarRes, activityRes] = await Promise.all([
        api.get('/analytics/me/radar/').catch(() => ({ data: { error: 'Radar failed' } })),
        api.get('/analytics/me/activity_heatmap/').catch(() => ({ data: [] })),
      ]);

      if (radarRes.data.error) {
        setErrorMsg(radarRes.data.error);
      } else {
        setRadarResponse(radarRes.data);
      }
      setActivity(activityRes.data);
    } catch (err) {
      console.error('Failed to load analytics data', err);
      setErrorMsg('Could not load diagnostic data.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeatmap = () => {
    const today = new Date();
    const startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const activityMap = new Map<string, number>();
    activity.forEach(item => activityMap.set(item.date, item.count));

    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < startDate.getDay(); i++) {
      currentWeek.push(null);
    }

    for (let i = 0; i <= 90; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      
      currentWeek.push({ date: dateStr, count });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    const getColorClass = (count: number) => {
      if (count === 0) return 'bg-gray-100 border-gray-200';
      if (count < 2) return 'bg-primary/30 border-primary/40';
      if (count < 4) return 'bg-primary/60 border-primary/70';
      return 'bg-primary border-primary-dark';
    };

    return (
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-1">
            {week.map((day, dIndex) => {
              if (!day) return <div key={dIndex} className="w-4 h-4 bg-transparent"></div>;
              return (
                <div 
                  key={dIndex}
                  className={`w-4 h-4 rounded-sm border ${getColorClass(day.count)} transition-all hover:scale-110 cursor-help`}
                  title={`${day.count} assessments on ${day.date}`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const getOverallReadiness = () => {
    if (!radarResponse || radarResponse.radar_data.length === 0) return 0;
    const totalTarget = radarResponse.radar_data.reduce((sum, item) => sum + item.target_level, 0);
    if (totalTarget === 0) return 100;
    const totalCurrent = radarResponse.radar_data.reduce((sum, item) => sum + item.current_level, 0);
    return Math.round((totalCurrent / totalTarget) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-jakarta">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Diagnostic Engine
          </h1>
          <p className="text-gray-600 mt-2">
            Track your competency gaps and role readiness.
          </p>
        </div>
        {radarResponse?.role && (
          <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Assigned Role</span>
            <span className="text-sm font-semibold text-gray-800">{radarResponse.role}</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 p-6 mb-8 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Readiness Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <Award size={28} />
          </div>
          <h2 className="text-xl font-bold mb-1 text-gray-900">Role Readiness</h2>
          <p className="text-5xl font-black text-primary mb-2">{getOverallReadiness()}%</p>
          <p className="text-sm text-gray-500">Based on target competencies</p>
        </div>

        {/* Heatmap Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Assessment Activity (90 Days)</h2>
          </div>
          {renderHeatmap()}
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-400 uppercase">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary/40"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/60 border border-primary/70"></div>
            <div className="w-3 h-3 rounded-sm bg-primary border border-primary-dark"></div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-gray-900">Competency Gap Analysis</h2>
        </div>
        
        {!radarResponse || radarResponse.radar_data.length === 0 ? (
          <p className="text-gray-500 text-sm">No target competencies defined for your role.</p>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {radarResponse.radar_data.map(item => {
              const maxLevel = 5;
              const currentPct = (item.current_level / maxLevel) * 100;
              const targetPct = (item.target_level / maxLevel) * 100;
              
              return (
                <div key={item.competency_id} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{item.domain}</span>
                      <h3 className="font-bold text-gray-900">{item.competency_name}</h3>
                    </div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <span className="text-primary">L{item.current_level.toFixed(1)}</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-gray-500">Target L{item.target_level.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${currentPct}%`, zIndex: 10 }}
                    ></div>
                    {/* Target marker */}
                    <div 
                      className="absolute top-0 h-full w-1 bg-red-500 shadow-sm"
                      style={{ left: `calc(${targetPct}% - 2px)`, zIndex: 20 }}
                      title={`Target Level ${item.target_level}`}
                    ></div>
                  </div>
                  {item.gap > 0 && (
                    <p className="text-xs text-red-500 font-semibold mt-1">
                      Gap of {item.gap.toFixed(1)} levels
                    </p>
                  )}
                  {item.gap === 0 && (
                    <p className="text-xs text-green-500 font-semibold mt-1">
                      Target reached!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
