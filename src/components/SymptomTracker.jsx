import React, { useState } from 'react';
import { Plus, TrendingUp, Calendar, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, parseISO, subDays } from 'date-fns';

const SymptomTracker = ({ user }) => {
  const [symptoms, setSymptoms] = useLocalStorage('healthsync_symptoms', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symptom: '',
    severity: 5,
    duration: '',
    notes: '',
    triggers: ''
  });

  const commonSymptoms = [
    'Headache', 'Fatigue', 'Nausea', 'Back Pain', 'Anxiety', 'Insomnia',
    'Fever', 'Cough', 'Dizziness', 'Muscle Pain', 'Stomach Pain', 'Stress'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSymptom = {
      logId: Date.now().toString(),
      userId: user.userId,
      ...formData,
      timestamp: new Date().toISOString()
    };
    setSymptoms([...symptoms, newSymptom]);
    setFormData({
      symptom: '',
      severity: 5,
      duration: '',
      notes: '',
      triggers: ''
    });
    setShowForm(false);
  };

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const daySymptoms = symptoms.filter(s => {
        const symptomDate = new Date(s.timestamp);
        return symptomDate.toDateString() === date.toDateString();
      });
      
      const avgSeverity = daySymptoms.length > 0 
        ? daySymptoms.reduce((sum, s) => sum + parseInt(s.severity), 0) / daySymptoms.length
        : 0;

      return {
        date: format(date, 'MM/dd'),
        severity: Math.round(avgSeverity * 10) / 10,
        count: daySymptoms.length
      };
    });
    return last7Days;
  };

  const getSymptomFrequency = () => {
    const frequency = {};
    symptoms.forEach(s => {
      frequency[s.symptom] = (frequency[s.symptom] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const recentSymptoms = symptoms.slice(-5).reverse();

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Log Symptom</h2>
          <button
            onClick={() => setShowForm(false)}
            className="text-white/70 hover:text-white"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            {/* Symptom Selection */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Symptom</label>
              <input
                type="text"
                value={formData.symptom}
                onChange={(e) => setFormData({...formData, symptom: e.target.value})}
                placeholder="Enter symptom or select below"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
              
              <div className="grid grid-cols-2 gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setFormData({...formData, symptom})}
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      formData.symptom === symptom
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Scale */}
            <div className="space-y-4">
              <label className="block text-white font-medium">
                Severity: {formData.severity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              >
                <option value="">Select duration</option>
                <option value="Less than 1 hour">Less than 1 hour</option>
                <option value="1-3 hours">1-3 hours</option>
                <option value="3-6 hours">3-6 hours</option>
                <option value="6-12 hours">6-12 hours</option>
                <option value="12-24 hours">12-24 hours</option>
                <option value="More than 24 hours">More than 24 hours</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>

            {/* Triggers */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Possible Triggers</label>
              <input
                type="text"
                value={formData.triggers}
                onChange={(e) => setFormData({...formData, triggers: e.target.value})}
                placeholder="e.g., stress, food, weather, activity"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional details..."
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Log Symptom
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Symptom Tracker</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Trend Chart */}
      {symptoms.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            7-Day Severity Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="severity" 
                  stroke="#60A5FA" 
                  strokeWidth={3}
                  dot={{ fill: '#60A5FA', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Most Common Symptoms */}
      {symptoms.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Most Common Symptoms</h3>
          <div className="space-y-3">
            {getSymptomFrequency().map(([symptom, count], index) => (
              <div key={symptom} className="flex justify-between items-center">
                <span className="text-white">{symptom}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(count / Math.max(...getSymptomFrequency().map(([,c]) => c))) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/70 text-sm w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Symptoms */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Symptoms
        </h3>
        {recentSymptoms.length > 0 ? (
          <div className="space-y-4">
            {recentSymptoms.map((symptom, index) => (
              <div key={symptom.logId} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{symptom.symptom}</h4>
                  <span className="text-xs text-white/60">
                    {format(parseISO(symptom.timestamp), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-white/70">
                  <p>Severity: {symptom.severity}/10</p>
                  <p>Duration: {symptom.duration}</p>
                  {symptom.triggers && <p>Triggers: {symptom.triggers}</p>}
                  {symptom.notes && <p>Notes: {symptom.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">No symptoms logged yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all duration-200"
            >
              Log Your First Symptom
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomTracker;