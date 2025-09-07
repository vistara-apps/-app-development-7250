import React, { useState } from 'react';
import { Plus, FileText, Upload, Download, Trash2, Search, Filter } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format } from 'date-fns';

const HealthRecords = ({ user }) => {
  const [records, setRecords] = useLocalStorage('healthsync_records', []);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    fileName: '',
    documentType: 'lab-result',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const documentTypes = [
    { value: 'lab-result', label: 'Lab Result', icon: '🔬' },
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'doctor-note', label: 'Doctor Note', icon: '👨‍⚕️' },
    { value: 'vaccination', label: 'Vaccination Record', icon: '💉' },
    { value: 'imaging', label: 'Imaging (X-ray, MRI)', icon: '📷' },
    { value: 'insurance', label: 'Insurance Document', icon: '📋' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate file upload - in a real app, this would upload to IPFS or cloud storage
    const newRecord = {
      recordId: Date.now().toString(),
      userId: user.userId,
      fileName: formData.fileName,
      fileUrl: `https://example.com/files/${Date.now()}`, // Simulated URL
      documentType: formData.documentType,
      description: formData.description,
      uploadDate: formData.date,
      uploadTimestamp: new Date().toISOString()
    };

    setRecords([...records, newRecord]);
    setFormData({
      fileName: '',
      documentType: 'lab-result',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowUpload(false);
  };

  const handleDelete = (id) => {
    setRecords(records.filter(r => r.recordId !== id));
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeInfo = (type) => {
    return documentTypes.find(t => t.value === type) || documentTypes[documentTypes.length - 1];
  };

  if (showUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Upload Health Record</h2>
          <button
            onClick={() => setShowUpload(false)}
            className="text-white/70 hover:text-white"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            {/* File Upload Simulation */}
            <div className="space-y-4">
              <label className="block text-white font-medium">File Name</label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData({...formData, fileName: e.target.value})}
                placeholder="Enter document name (e.g., Blood Test Results)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
              <p className="text-sm text-white/60">
                Note: In a real implementation, this would include actual file upload functionality
              </p>
            </div>

            {/* Document Type */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Document Type</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({...formData, documentType: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Document Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the document contents"
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Upload Record
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Health Records</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-white/50" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all">All Types</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const typeInfo = getTypeInfo(record.documentType);
            return (
              <div key={record.recordId} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{typeInfo.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{record.fileName}</h4>
                      <p className="text-sm text-white/70 mb-2">{typeInfo.label}</p>
                      {record.description && (
                        <p className="text-sm text-white/60 mb-2">{record.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-white/50">
                        <span>Uploaded: {format(new Date(record.uploadTimestamp), 'MMM dd, yyyy')}</span>
                        {record.uploadDate !== record.uploadTimestamp.split('T')[0] && (
                          <span>Document Date: {format(new Date(record.uploadDate), 'MMM dd, yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Simulate download - in real app would download from fileUrl
                        alert('Download functionality would be implemented here');
                      }}
                      className="text-white/70 hover:text-white p-2"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.recordId)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 mb-4">
              {searchTerm || filterType !== 'all' ? 'No records match your search' : 'No health records yet'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => setShowUpload(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all duration-200"
              >
                Upload Your First Record
              </button>
            )}
          </div>
        </div>
      )}

      {/* Storage Info */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Storage Used</span>
          <span className="text-white">{records.length} files stored locally</span>
        </div>
        <p className="text-xs text-white/50 mt-2">
          In production, files would be stored securely on IPFS or similar decentralized storage
        </p>
      </div>
    </div>
  );
};

export default HealthRecords;