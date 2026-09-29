import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../api';

interface Material {
  id: number;
  title: string;
  material_type: string;
  status: string;
  uploaded_at: string;
}

export default function ContentStudioIndex() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState('pdf');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/content/materials/');
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to fetch materials', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('material_type', materialType);
    formData.append('file', file);

    try {
      setUploading(true);
      await api.post('/content/materials/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload successful. Material is queued for background processing.');
      setFile(null);
      setTitle('');
      fetchMaterials();
    } catch (err) {
      console.error('Failed to upload', err);
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': 
      case 'processing': return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-jakarta">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UploadCloud className="w-8 h-8 text-primary" />
          Content Studio
        </h1>
        <p className="text-gray-600 mt-2">
          Upload PDF documents or Videos. The AI engine will automatically transcribe, chunk, and embed them into the RAG vector store in the background.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Material</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Sampling Guidelines 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMaterialType('pdf')}
                  className={`py-2 flex items-center justify-center gap-2 rounded-xl border font-semibold ${materialType === 'pdf' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500'}`}
                >
                  <FileText className="w-4 h-4" /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialType('video')}
                  className={`py-2 flex items-center justify-center gap-2 rounded-xl border font-semibold ${materialType === 'video' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500'}`}
                >
                  <Video className="w-4 h-4" /> Video
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                accept={materialType === 'pdf' ? '.pdf' : 'video/*'}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !file || !title}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload & Process'}
            </button>
          </form>
        </div>

        {/* Materials List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Library</h2>
            <button onClick={fetchMaterials} className="text-primary text-sm font-semibold hover:underline">
              Refresh Status
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
              No materials uploaded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map(mat => (
                <div key={mat.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${mat.material_type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      {mat.material_type === 'pdf' ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{mat.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Uploaded {new Date(mat.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(mat.status)}
                    <span className="text-sm font-semibold text-gray-700 capitalize">{mat.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
