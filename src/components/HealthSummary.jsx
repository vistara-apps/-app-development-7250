import React, { useState } from 'react';
import { Share2, Download, Calendar, Activity, Pill, FileText, User, Mail } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, subDays, parseISO } from 'date-fns';

const HealthSummary = ({ user }) => {
  const [symptoms] = useLocalStorage('healthsync_symptoms', []);
  const [reminders] = useLocalStorage('healthsync_reminders', []);
  const [records] = useLocalStorage('healthsync_records', []);
  
  const [timeRange, setTimeRange] = useState('30');
  const [includeSymptoms, setIncludeSymptoms] = useState(true);
  const [includeMedications, setIncludeMedications] = useState(true);
  const [includeRecords, setIncludeRecords] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const timeRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: 'all', label: 'All time' }
  ];

  const getFilteredData = () => {
    const cutoffDate = timeRange === 'all' 
      ? new Date(0) 
      : subDays(new Date(), parseInt(timeRange));

    const filteredSymptoms = symptoms.filter(s => 
      new Date(s.timestamp) >= cutoffDate
    );

    const activeMedications = reminders.filter(r => 
      r.type === 'medication' && r.isEnabled
    );

    const recentRecords = records.filter(r => 
      new Date(r.uploadTimestamp) >= cutoffDate
    );

    return {
      symptoms: filteredSymptoms,
      medications: activeMedications,
      records: recentRecords
    };
  };

  const data = getFilteredData();

  const generateSummary = () => {
    const summary = {
      patientInfo: {
        id: user.farcasterId,
        walletAddress: user.walletAddress,
        generatedDate: new Date().toISOString(),
        timeRange: timeRange === 'all' ? 'All time' : `Last ${timeRange} days`
      },
      symptoms: includeSymptoms ? data.symptoms : [],
      medications: includeMedications ? data.medications : [],
      records: includeRecords ? data.records : []
    };

    return summary;
  };

  const handleShare = () => {
    const summary = generateSummary();
    const summaryText = `HealthSync Summary\n\nGenerated: ${format(new Date(), 'PPP')}\nTime Range: ${summary.patientInfo.timeRange}\n\nSymptoms Logged: ${summary.symptoms.length}\nActive Medications: ${summary.medications.length}\nHealth Records: ${summary.records.length}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'HealthSync Summary',
        text: summaryText,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(summaryText).then(() => {
        alert('Summary copied to clipboard!');
      });
    }
  };

  const handleDownload = () => {
    const summary = generateSummary();
    const dataStr = JSON.stringify(summary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `healthsync-summary-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getSymptomStats = () => {
    if (data.symptoms.length === 0) return null;

    const avgSeverity = data.symptoms.reduce((sum, s) => sum + parseInt(s.severity), 0) / data.symptoms.length;
    const mostCommon = data.symptoms.reduce((acc, symptom) => {
      acc[symptom.symptom] = (acc[symptom.symptom] || 0) + 1;
      return acc;
    }, {});
    
    const topSymptom = Object.entries(mostCommon).sort(([,a], [,b]) => b - a)[0];

    return {
      totalLogs: data.symptoms.length,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      mostCommonSymptom: topSymptom ? topSymptom[0] : 'N/A',
      mostCommonCount: topSymptom ? topSymptom[1] : 0
    };
  };

  const symptomStats = getSymptomStats();

  if (showPreview) {
    const summary = generateSummary();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Health Summary Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="text-white/70 hover:text-white"
          >
            Back to Options
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          {/* Header */}
          <div className="border-b border-white/20 pb-4 mb-6">
            <h3 className="text-xl font-bold text-white mb-2">HealthSync Medical Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/70">Patient ID:</p>
                <p className="text-white font-mono">{summary.patientInfo.id}</p>
              </div>
              <div>
                <p className="text-white/70">Generated:</p>
                <p className="text-white">{format(new Date(summary.patientInfo.generatedDate), 'PPP')}</p>
              </div>
              <div>
                <p className="text-white/70">Time Range:</p>
                <p className="text-white">{summary.patientInfo.timeRange}</p>
              </div>
              <div>
                <p className="text-white/70">Wallet:</p>
                <p className="text-white font-mono text-xs">{summary.patientInfo.walletAddress}</p>
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          {includeSymptoms && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Symptoms Overview
              </h4>
              {symptomStats ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/70">Total Logs</p>
                      <p className="text-xl font-bold text-white">{symptomStats.totalLogs}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/70">Avg Severity</p>
                      <p className="text-xl font-bold text-white">{symptomStats.avgSeverity}/10</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/70">Most Common Symptom</p>
                    <p className="text-white font-medium">{symptomStats.mostCommonSymptom} ({symptomStats.mostCommonCount} times)</p>
                  </div>
                  
                  {/* Recent Symptoms */}
                  <div>
                    <p className="text-white/70 mb-2">Recent Symptoms:</p>
                    <div className="space-y-2">
                      {summary.symptoms.slice(-5).map((symptom, index) => (
                        <div key={index} className="bg-white/5 rounded p-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white">{symptom.symptom}</span>
                            <span className="text-white/70">{symptom.severity}/10</span>
                          </div>
                          <p className="text-white/60 text-xs">{format(parseISO(symptom.timestamp), 'MMM dd, yyyy')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/70">No symptoms logged in this time period</p>
              )}
            </div>
          )}

          {/* Medications Section */}
          {includeMedications && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Current Medications
              </h4>
              {summary.medications.length > 0 ? (
                <div className="space-y-2">
                  {summary.medications.map((med, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{med.details}</p>
                          <p className="text-white/70 text-sm">{med.frequency} at {med.time}</p>
                        </div>
                        <span className="text-green-400 text-sm">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70">No active medications</p>
              )}
            </div>
          )}

          {/* Records Section */}
          {includeRecords && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Health Records
              </h4>
              {summary.records.length > 0 ? (
                <div className="space-y-2">
                  {summary.records.map((record, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{record.fileName}</p>
                          <p className="text-white/70 text-sm capitalize">{record.documentType.replace('-', ' ')}</p>
                        </div>
                        <span className="text-white/60 text-xs">
                          {format(new Date(record.uploadDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70">No records in this time period</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4 border-t border-white/20">
            <button
              onClick={handleShare}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Summary</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Health Summary</h2>
      </div>

      {/* Configuration */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Summary Options</h3>
        
        {/* Time Range */}
        <div className="space-y-4">
          <label className="block text-white font-medium">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Include Options */}
        <div className="space-y-3">
          <label className="block text-white font-medium mb-2">Include in Summary</label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={includeSymptoms}
              onChange={(e) => setIncludeSymptoms(e.target.checked)}
              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <span className="text-white">Symptoms & Trends</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={includeMedications}
              onChange={(e) => setIncludeMedications(e.target.checked)}
              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <span className="text-white">Current Medications</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={includeRecords}
              onChange={(e) => setIncludeRecords(e.target.checked)}
              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <span className="text-white">Health Records</span>
          </label>
        </div>
      </div>

      {/* Preview Button */}
      <button
        onClick={() => setShowPreview(true)}
        className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-4 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <FileText className="w-5 h-5" />
        <span>Generate Summary</span>
      </button>

      {/* Data Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{data.symptoms.length}</p>
              <p className="text-sm text-white/70">Symptoms</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <Pill className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{data.medications.length}</p>
              <p className="text-sm text-white/70">Medications</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{data.records.length}</p>
              <p className="text-sm text-white/70">Records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h4 className="font-medium text-white mb-2">About Health Summaries</h4>
        <p className="text-sm text-white/70 mb-2">
          Generate comprehensive health reports to share with healthcare providers. 
          Summaries include your symptoms, medications, and health records in a professional format.
        </p>
        <p className="text-xs text-white/50">
          All data is stored locally and processed securely. You control what information to include in each summary.
        </p>
      </div>
    </div>
  );
};

export default HealthSummary;