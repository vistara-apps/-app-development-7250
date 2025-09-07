# HealthSync - Your All-in-One Health Assistant

![HealthSync](https://img.shields.io/badge/HealthSync-v1.0.0-purple)
![Base MiniApp](https://img.shields.io/badge/Base-MiniApp-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)

**Your All-in-One Health Assistant, Powered by You.**

HealthSync is a smart health assistant built as a Base Wallet MiniApp that helps users track symptoms, manage medications, store health records, and share summaries with healthcare providers.

## 🌟 Features

### ✅ Core Features (Fully Implemented)

#### 🩺 Symptom Tracker & Trend Analysis
- Log symptoms with severity, duration, and triggers
- Visual trend analysis with interactive charts
- Pattern recognition and correlation insights
- Historical data visualization

#### 💊 Medication & Appointment Reminders
- Customizable medication reminders
- Appointment scheduling and notifications
- Recurring reminder support
- Push notification integration

#### 📋 Centralized Health Record Hub
- Secure document upload and storage
- Multiple document type support (lab results, prescriptions, etc.)
- Search and filter functionality
- IPFS integration for decentralized storage

#### 📊 Shareable Health Summary
- Generate comprehensive health reports
- Customizable time ranges and data inclusion
- Multiple export formats (JSON, CSV)
- Shareable links for healthcare providers

#### ⚙️ Advanced Settings & Data Management
- Base Wallet and Farcaster integration
- Data backup and restore functionality
- Import/export capabilities
- Privacy and notification controls

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18.2.0** - Modern React with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation

### Design System
- **Theme**: Purple gradient with glass-effect UI
- **Layout**: 12-column fluid grid, responsive design
- **Typography**: System font stack with semantic tokens
- **Motion**: Smooth transitions with cubic-bezier easing

### Data Management
- **Local Storage**: Persistent data storage
- **Backup System**: Automated and manual backups
- **Export/Import**: JSON and CSV format support
- **Data Validation**: Comprehensive input validation

### Web3 Integration
- **Base Protocol**: Wallet-native experience
- **Farcaster Identity**: Decentralized identity management
- **IPFS Storage**: Decentralized document storage
- **Notification System**: Browser push notifications

## 📱 User Interface

### Navigation
- **Dashboard**: Overview of health data and quick actions
- **Symptoms**: Symptom logging and trend visualization
- **Reminders**: Medication and appointment management
- **Records**: Health document storage and management
- **Summary**: Shareable health report generation
- **Settings**: App configuration and data management

### Responsive Design
- Mobile-first approach
- Optimized for Base Wallet MiniApp environment
- Touch-friendly interface
- Accessible design patterns

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser

### Quick Start
```bash
# Clone the repository
git clone https://github.com/vistara-apps/healthsync.git

# Navigate to project directory
cd healthsync

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Configuration
```bash
# Create .env file
VITE_APP_NAME=HealthSync
VITE_APP_VERSION=1.0.0
VITE_BASE_NETWORK=mainnet
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## 📊 Data Models

### User Entity
```javascript
{
  userId: string,
  farcasterId: string,
  walletAddress: string,
  preferences: object
}
```

### Symptom Log Entity
```javascript
{
  logId: string,
  userId: string,
  symptom: string,
  severity: number (1-10),
  duration: string,
  triggers: string,
  notes: string,
  timestamp: ISO string
}
```

### Reminder Entity
```javascript
{
  reminderId: string,
  userId: string,
  type: 'medication' | 'appointment',
  details: string,
  time: string,
  frequency: string,
  isEnabled: boolean,
  notes: string
}
```

### Health Record Entity
```javascript
{
  recordId: string,
  userId: string,
  fileName: string,
  fileUrl: string,
  documentType: string,
  uploadTimestamp: ISO string,
  description: string
}
```

## 🔐 Security & Privacy

### Data Protection
- All data stored locally in browser
- No server-side data storage
- User controls all data sharing
- Secure backup and restore functionality

### Web3 Integration
- Base Wallet connection for identity
- Farcaster ID for decentralized identity
- IPFS for decentralized document storage
- No centralized data collection

## 🚀 Deployment

### Base MiniApp Deployment
1. Build the application: `npm run build`
2. Deploy to Base-compatible hosting
3. Configure Base Wallet integration
4. Test MiniApp functionality

### Production Checklist
- [ ] Environment variables configured
- [ ] Base Wallet integration tested
- [ ] Farcaster identity working
- [ ] IPFS storage functional
- [ ] Notification permissions working
- [ ] Data backup/restore tested
- [ ] Mobile responsiveness verified

## 🧪 Testing

### Manual Testing Checklist
- [ ] Symptom logging and visualization
- [ ] Medication reminder creation and notifications
- [ ] Health record upload and management
- [ ] Health summary generation and sharing
- [ ] Settings and preferences management
- [ ] Data export/import functionality
- [ ] Base Wallet connection
- [ ] Responsive design on mobile

## 📈 Business Model

### Freemium Model
- **Free Tier**: Basic symptom tracking, limited history
- **Pro Tier ($3/month)**: Extended history, advanced analytics, priority support
- **Enterprise**: Custom integrations for healthcare providers

### Revenue Streams
1. Subscription fees from Pro users
2. Micro-transactions for premium features
3. Healthcare provider integrations
4. Anonymous health data insights (opt-in)

## 🛣️ Roadmap

### Phase 1 (Current) ✅
- Core health tracking features
- Base MiniApp integration
- Local data storage
- Basic sharing capabilities

### Phase 2 (Planned)
- AI-powered health insights
- Healthcare provider integrations
- Advanced analytics dashboard
- Multi-language support

### Phase 3 (Future)
- Wearable device integration
- Telemedicine features
- Community health features
- Advanced AI recommendations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

### Community
- [Discord Community](https://discord.gg/healthsync)
- [GitHub Discussions](https://github.com/vistara-apps/healthsync/discussions)
- [Twitter](https://twitter.com/healthsync)

### Contact
- Email: support@healthsync.app
- Website: https://healthsync.app

---

**Built with ❤️ for the Base ecosystem**

*HealthSync - Empowering users to take control of their health data with Web3 technology.*
