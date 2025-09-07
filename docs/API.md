# HealthSync API Documentation

## Overview

HealthSync is built as a client-side application with local data storage and Web3 integrations. This document outlines the internal APIs, data structures, and integration points.

## Data Storage API

### Local Storage Keys

```javascript
// User data
'healthsync_user' - User profile and preferences
'healthsync_preferences' - App settings and preferences

// Health data
'healthsync_symptoms' - Symptom logs array
'healthsync_reminders' - Medication/appointment reminders array
'healthsync_records' - Health records metadata array

// System data
'healthsync_backups' - Data backups array
```

### Data Structures

#### User Object
```typescript
interface User {
  userId: string;
  farcasterId?: string;
  walletAddress?: string;
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
  };
}
```

#### Symptom Log Object
```typescript
interface SymptomLog {
  logId: string;
  userId: string;
  symptom: string;
  severity: number; // 1-10
  duration: string;
  triggers?: string;
  notes?: string;
  timestamp: string; // ISO date
  createdAt: string;
  updatedAt: string;
}
```

#### Reminder Object
```typescript
interface Reminder {
  reminderId: string;
  userId: string;
  type: 'medication' | 'appointment';
  details: string;
  time: string; // HH:MM format
  frequency: 'daily' | 'weekly' | 'monthly' | 'as-needed';
  isEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Health Record Object
```typescript
interface HealthRecord {
  recordId: string;
  userId: string;
  fileName: string;
  fileUrl: string; // IPFS URL or local blob URL
  documentType: 'lab-results' | 'prescription' | 'imaging' | 'vaccination' | 'other';
  uploadTimestamp: string;
  uploadDate: string; // Document date
  description?: string;
  fileSize?: number;
  mimeType?: string;
}
```

## Hooks API

### useLocalStorage Hook

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

**Usage:**
```javascript
const [symptoms, setSymptoms] = useLocalStorage('healthsync_symptoms', []);
```

### useNotifications Hook

```typescript
interface NotificationHook {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => Notification | null;
  scheduleReminder: (reminder: Reminder) => void;
}
```

**Usage:**
```javascript
const { permission, requestPermission, scheduleReminder } = useNotifications();
```

## Base Integration API

### BaseIntegration Class

```typescript
class BaseIntegration {
  // Connection management
  connectWallet(): Promise<{
    success: boolean;
    walletAddress?: string;
    farcasterId?: string;
    error?: string;
  }>;
  
  disconnect(): void;
  
  getConnectionStatus(): {
    isConnected: boolean;
    walletAddress: string | null;
    farcasterId: string | null;
  };
  
  // Network validation
  validateNetwork(): Promise<{
    success: boolean;
    isBaseNetwork: boolean;
    chainId: string | null;
    networkName: string;
    error?: string;
  }>;
  
  // IPFS integration
  uploadToIPFS(file: File): Promise<{
    success: boolean;
    hash?: string;
    url?: string;
    size?: number;
    error?: string;
  }>;
  
  // Sharing functionality
  generateShareableLink(summaryData: any): Promise<{
    success: boolean;
    shareId?: string;
    url?: string;
    expiresIn?: string;
    error?: string;
  }>;
}
```

### Farcaster Utils

```typescript
interface FarcasterUtils {
  formatFarcasterId(id: string): string;
  generateHealthCast(summaryData: any): {
    text: string;
    embeds: any[];
    mentions: any[];
    tags: string[];
  };
  isValidFarcasterId(id: string): boolean;
}
```

## Data Manager API

### DataManager Class

```typescript
class DataManager {
  // Export functionality
  exportAllData(): Promise<{
    success: boolean;
    data?: ExportData;
    size?: number;
    error?: string;
  }>;
  
  exportAsCSV(dataType: 'symptoms' | 'reminders' | 'records'): {
    success: boolean;
    csv?: string;
    filename?: string;
    error?: string;
  };
  
  // Import functionality
  importData(importData: ExportData): Promise<{
    success: boolean;
    imported?: {
      symptoms: number;
      reminders: number;
      records: number;
    };
    backupId?: string;
    error?: string;
  }>;
  
  // Backup management
  createBackup(): Promise<{
    success: boolean;
    id?: string;
    timestamp?: string;
    error?: string;
  }>;
  
  restoreFromBackup(backupId: string): Promise<{
    success: boolean;
    restored?: {
      symptoms: number;
      reminders: number;
      records: number;
    };
    error?: string;
  }>;
  
  getBackups(): BackupInfo[];
  
  // Storage statistics
  getStorageStats(): {
    totalSize: number;
    breakdown: {
      symptoms: number;
      reminders: number;
      records: number;
      user: number;
      backups: number;
    };
    itemCounts: {
      symptoms: number;
      reminders: number;
      records: number;
      backups: number;
    };
  } | null;
}
```

### Export Data Structure

```typescript
interface ExportData {
  version: string;
  exportDate: string;
  user: {
    userId: string;
    farcasterId?: string;
    preferences: any;
  };
  data: {
    symptoms: SymptomLog[];
    reminders: Reminder[];
    records: HealthRecord[];
  };
  metadata: {
    totalSymptoms: number;
    totalReminders: number;
    totalRecords: number;
    dateRange?: {
      earliest: string;
      latest: string;
      span: number;
    };
  };
}
```

## Component APIs

### Dashboard Component

```typescript
interface DashboardProps {
  user: User;
  onNavigate: (tab: string) => void;
}
```

### SymptomTracker Component

```typescript
interface SymptomTrackerProps {
  user: User;
}
```

### MedicationReminders Component

```typescript
interface MedicationRemindersProps {
  user: User;
}
```

### HealthRecords Component

```typescript
interface HealthRecordsProps {
  user: User;
}
```

### HealthSummary Component

```typescript
interface HealthSummaryProps {
  user: User;
}
```

### Settings Component

```typescript
interface SettingsProps {
  user: User;
  onUserUpdate: (user: User) => void;
}
```

## Error Handling

### Error Types

```typescript
type HealthSyncError = 
  | 'STORAGE_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'PERMISSION_ERROR'
  | 'EXPORT_ERROR'
  | 'IMPORT_ERROR'
  | 'BACKUP_ERROR';

interface ErrorResponse {
  success: false;
  error: string;
  code?: HealthSyncError;
  details?: any;
}
```

### Error Handling Patterns

```javascript
// Async operations
try {
  const result = await dataManager.exportAllData();
  if (!result.success) {
    console.error('Export failed:', result.error);
    // Handle error appropriately
  }
} catch (error) {
  console.error('Unexpected error:', error);
}

// Validation
const validateSymptomData = (data) => {
  if (!data.symptom || data.symptom.trim() === '') {
    return { valid: false, error: 'Symptom name is required' };
  }
  if (data.severity < 1 || data.severity > 10) {
    return { valid: false, error: 'Severity must be between 1 and 10' };
  }
  return { valid: true };
};
```

## Integration Points

### Base Wallet Integration

```javascript
// Connect to Base Wallet
const connectWallet = async () => {
  const result = await baseIntegration.connectWallet();
  if (result.success) {
    // Update user state
    setUser(prev => ({
      ...prev,
      walletAddress: result.walletAddress,
      farcasterId: result.farcasterId
    }));
  }
};
```

### Notification Integration

```javascript
// Schedule medication reminder
const scheduleReminder = (reminder) => {
  if (permission === 'granted') {
    const { scheduleReminder } = useNotifications();
    scheduleReminder(reminder);
  }
};
```

### IPFS Integration

```javascript
// Upload health record to IPFS
const uploadRecord = async (file) => {
  const result = await baseIntegration.uploadToIPFS(file);
  if (result.success) {
    const record = {
      recordId: generateId(),
      fileName: file.name,
      fileUrl: result.url,
      uploadTimestamp: new Date().toISOString()
    };
    // Save record metadata
  }
};
```

## Security Considerations

### Data Privacy
- All sensitive data stored locally
- No server-side data transmission
- User controls all data sharing
- Secure backup encryption (planned)

### Input Validation
- Client-side validation for all inputs
- Sanitization of user-generated content
- File type and size validation
- Date and time validation

### Web3 Security
- Wallet connection validation
- Network verification
- Transaction signing (future feature)
- IPFS content addressing

## Performance Considerations

### Data Management
- Lazy loading of large datasets
- Pagination for symptom history
- Efficient local storage usage
- Background data processing

### UI Performance
- Component memoization
- Virtual scrolling for large lists
- Debounced search inputs
- Optimized re-renders

## Future API Extensions

### Planned Features
- Healthcare provider API integration
- Wearable device data sync
- AI-powered health insights
- Multi-user family accounts
- Telemedicine integration

### API Versioning
- Semantic versioning for data structures
- Migration utilities for data upgrades
- Backward compatibility maintenance
- Feature flag system

---

This API documentation is maintained alongside the codebase and updated with each release.
