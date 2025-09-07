// Data Management Utilities for HealthSync
// Handles data export, import, backup, and synchronization

export class DataManager {
  constructor() {
    this.version = '1.0.0';
    this.supportedFormats = ['json', 'csv', 'pdf'];
  }

  // Export all health data
  async exportAllData() {
    try {
      const symptoms = JSON.parse(localStorage.getItem('healthsync_symptoms') || '[]');
      const reminders = JSON.parse(localStorage.getItem('healthsync_reminders') || '[]');
      const records = JSON.parse(localStorage.getItem('healthsync_records') || '[]');
      const user = JSON.parse(localStorage.getItem('healthsync_user') || '{}');

      const exportData = {
        version: this.version,
        exportDate: new Date().toISOString(),
        user: {
          userId: user.userId,
          farcasterId: user.farcasterId,
          preferences: user.preferences
        },
        data: {
          symptoms,
          reminders,
          records
        },
        metadata: {
          totalSymptoms: symptoms.length,
          totalReminders: reminders.length,
          totalRecords: records.length,
          dateRange: this.getDateRange(symptoms)
        }
      };

      return {
        success: true,
        data: exportData,
        size: JSON.stringify(exportData).length
      };
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Import health data
  async importData(importData) {
    try {
      // Validate import data structure
      if (!this.validateImportData(importData)) {
        throw new Error('Invalid import data format');
      }

      // Backup current data before import
      const backup = await this.createBackup();
      
      // Import data with conflict resolution
      const { symptoms, reminders, records } = importData.data;
      
      // Merge with existing data (avoiding duplicates)
      const existingSymptoms = JSON.parse(localStorage.getItem('healthsync_symptoms') || '[]');
      const existingReminders = JSON.parse(localStorage.getItem('healthsync_reminders') || '[]');
      const existingRecords = JSON.parse(localStorage.getItem('healthsync_records') || '[]');

      const mergedSymptoms = this.mergeArrays(existingSymptoms, symptoms, 'logId');
      const mergedReminders = this.mergeArrays(existingReminders, reminders, 'reminderId');
      const mergedRecords = this.mergeArrays(existingRecords, records, 'recordId');

      // Save merged data
      localStorage.setItem('healthsync_symptoms', JSON.stringify(mergedSymptoms));
      localStorage.setItem('healthsync_reminders', JSON.stringify(mergedReminders));
      localStorage.setItem('healthsync_records', JSON.stringify(mergedRecords));

      return {
        success: true,
        imported: {
          symptoms: symptoms.length,
          reminders: reminders.length,
          records: records.length
        },
        backupId: backup.id
      };
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create data backup
  async createBackup() {
    try {
      const exportResult = await this.exportAllData();
      if (!exportResult.success) {
        throw new Error('Failed to create backup');
      }

      const backupId = `backup_${Date.now()}`;
      const backup = {
        id: backupId,
        timestamp: new Date().toISOString(),
        data: exportResult.data
      };

      // Store backup in localStorage (in production, this would go to secure storage)
      const existingBackups = JSON.parse(localStorage.getItem('healthsync_backups') || '[]');
      existingBackups.push(backup);
      
      // Keep only last 5 backups
      const recentBackups = existingBackups.slice(-5);
      localStorage.setItem('healthsync_backups', JSON.stringify(recentBackups));

      return {
        success: true,
        id: backupId,
        timestamp: backup.timestamp
      };
    } catch (error) {
      console.error('Backup creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId) {
    try {
      const backups = JSON.parse(localStorage.getItem('healthsync_backups') || '[]');
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Clear current data
      localStorage.removeItem('healthsync_symptoms');
      localStorage.removeItem('healthsync_reminders');
      localStorage.removeItem('healthsync_records');

      // Restore backup data
      const { symptoms, reminders, records } = backup.data.data;
      localStorage.setItem('healthsync_symptoms', JSON.stringify(symptoms));
      localStorage.setItem('healthsync_reminders', JSON.stringify(reminders));
      localStorage.setItem('healthsync_records', JSON.stringify(records));

      return {
        success: true,
        restored: {
          symptoms: symptoms.length,
          reminders: reminders.length,
          records: records.length
        }
      };
    } catch (error) {
      console.error('Restore failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available backups
  getBackups() {
    try {
      const backups = JSON.parse(localStorage.getItem('healthsync_backups') || '[]');
      return backups.map(backup => ({
        id: backup.id,
        timestamp: backup.timestamp,
        size: JSON.stringify(backup.data).length
      }));
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }

  // Export data as CSV
  exportAsCSV(dataType = 'symptoms') {
    try {
      const data = JSON.parse(localStorage.getItem(`healthsync_${dataType}`) || '[]');
      
      if (data.length === 0) {
        return { success: false, error: 'No data to export' };
      }

      let csv = '';
      let headers = [];

      switch (dataType) {
        case 'symptoms':
          headers = ['Date', 'Symptom', 'Severity', 'Duration', 'Triggers', 'Notes'];
          csv = headers.join(',') + '\n';
          data.forEach(item => {
            csv += [
              new Date(item.timestamp).toLocaleDateString(),
              `"${item.symptom}"`,
              item.severity,
              `"${item.duration}"`,
              `"${item.triggers || ''}"`,
              `"${item.notes || ''}"`
            ].join(',') + '\n';
          });
          break;

        case 'reminders':
          headers = ['Type', 'Details', 'Time', 'Frequency', 'Status', 'Notes'];
          csv = headers.join(',') + '\n';
          data.forEach(item => {
            csv += [
              item.type,
              `"${item.details}"`,
              item.time,
              item.frequency,
              item.isEnabled ? 'Active' : 'Inactive',
              `"${item.notes || ''}"`
            ].join(',') + '\n';
          });
          break;

        case 'records':
          headers = ['File Name', 'Type', 'Upload Date', 'Description'];
          csv = headers.join(',') + '\n';
          data.forEach(item => {
            csv += [
              `"${item.fileName}"`,
              item.documentType,
              new Date(item.uploadTimestamp).toLocaleDateString(),
              `"${item.description || ''}"`
            ].join(',') + '\n';
          });
          break;
      }

      return {
        success: true,
        csv,
        filename: `healthsync-${dataType}-${new Date().toISOString().split('T')[0]}.csv`
      };
    } catch (error) {
      console.error('CSV export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate import data structure
  validateImportData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || !data.data) return false;
    if (!data.data.symptoms || !data.data.reminders || !data.data.records) return false;
    
    return Array.isArray(data.data.symptoms) && 
           Array.isArray(data.data.reminders) && 
           Array.isArray(data.data.records);
  }

  // Merge arrays avoiding duplicates
  mergeArrays(existing, incoming, idField) {
    const existingIds = new Set(existing.map(item => item[idField]));
    const newItems = incoming.filter(item => !existingIds.has(item[idField]));
    return [...existing, ...newItems];
  }

  // Get date range from symptoms data
  getDateRange(symptoms) {
    if (symptoms.length === 0) return null;
    
    const dates = symptoms.map(s => new Date(s.timestamp)).sort();
    return {
      earliest: dates[0].toISOString(),
      latest: dates[dates.length - 1].toISOString(),
      span: Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24))
    };
  }

  // Get storage usage statistics
  getStorageStats() {
    try {
      const symptoms = localStorage.getItem('healthsync_symptoms') || '[]';
      const reminders = localStorage.getItem('healthsync_reminders') || '[]';
      const records = localStorage.getItem('healthsync_records') || '[]';
      const user = localStorage.getItem('healthsync_user') || '{}';
      const backups = localStorage.getItem('healthsync_backups') || '[]';

      const totalSize = symptoms.length + reminders.length + records.length + user.length + backups.length;
      
      return {
        totalSize,
        breakdown: {
          symptoms: symptoms.length,
          reminders: reminders.length,
          records: records.length,
          user: user.length,
          backups: backups.length
        },
        itemCounts: {
          symptoms: JSON.parse(symptoms).length,
          reminders: JSON.parse(reminders).length,
          records: JSON.parse(records).length,
          backups: JSON.parse(backups).length
        }
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const dataManager = new DataManager();

export default dataManager;
