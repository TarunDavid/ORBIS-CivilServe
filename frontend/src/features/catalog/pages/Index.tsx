import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../../../api';

interface Competency {
  id: number;
  name: string;
  domain: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  provider: string;
  external_id: string;
  source_url: string;
  duration_minutes: number;
  competencies: Competency[];
}

export default function CatalogIndex() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/catalog/courses/');
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingId(courseId);
      await api.post(`/catalog/courses/${courseId}/enroll/`);
      alert('Successfully enrolled!');
      // In a real app, you'd update UI state to show "Enrolled" 
      // but for now we just alert.
    } catch (err) {
      console.error('Failed to enroll', err);
      alert('Error enrolling. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.provider === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto font-jakarta">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Training Catalog</h1>
        <p className="text-gray-600 mt-2">
          Discover and enroll in courses from iGOT Karmayogi, TPAC, and other partners.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            <option value="all">All Providers</option>
            <option value="igot">iGOT Karmayogi</option>
            <option value="tpac">TPAC</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                  {course.provider === 'igot' ? 'iGOT' : course.provider.toUpperCase()}
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration_minutes}m
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">
                {course.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Builds Competencies:</h4>
                <div className="flex flex-wrap gap-2">
                  {course.competencies.map(comp => (
                    <span key={comp.id} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                      {comp.name}
                    </span>
                  ))}
                  {course.competencies.length === 0 && (
                    <span className="text-sm text-gray-400">General</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingId === course.id}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex justify-center items-center disabled:opacity-70"
                >
                  {enrollingId === course.id ? (
                    <span className="animate-pulse">Enrolling...</span>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
                {course.source_url && (
                  <a 
                    href={course.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    title="View Source"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {filteredCourses.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">No courses found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
