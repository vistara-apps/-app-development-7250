// Base Protocol and Farcaster Integration Utilities
// This provides the foundation for Web3 interactions as specified in the PRD

export class BaseIntegration {
  constructor() {
    this.isConnected = false;
    this.walletAddress = null;
    this.farcasterId = null;
  }

  // Simulate Base Wallet connection
  async connectWallet() {
    try {
      // In a real implementation, this would use Base's wallet connection
      // For now, we simulate the connection
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        this.walletAddress = accounts[0];
        this.isConnected = true;
        
        // Simulate Farcaster ID retrieval
        this.farcasterId = `fc_${this.walletAddress.slice(-8)}`;
        
        return {
          success: true,
          walletAddress: this.walletAddress,
          farcasterId: this.farcasterId
        };
      } else {
        // Fallback for demo purposes
        this.walletAddress = '0x' + Math.random().toString(16).substr(2, 40);
        this.farcasterId = `fc_demo_${Date.now()}`;
        this.isConnected = true;
        
        return {
          success: true,
          walletAddress: this.walletAddress,
          farcasterId: this.farcasterId
        };
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disconnect wallet
  disconnect() {
    this.isConnected = false;
    this.walletAddress = null;
    this.farcasterId = null;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      walletAddress: this.walletAddress,
      farcasterId: this.farcasterId
    };
  }

  // Simulate IPFS storage for health records
  async uploadToIPFS(file) {
    try {
      // In production, this would upload to IPFS
      // For demo, we simulate the upload
      const simulatedHash = 'Qm' + Math.random().toString(36).substr(2, 44);
      
      return {
        success: true,
        hash: simulatedHash,
        url: `https://ipfs.io/ipfs/${simulatedHash}`,
        size: file.size || 1024
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate shareable health summary link
  generateShareableLink(summaryData) {
    try {
      // In production, this would create a secure, temporary link
      const encodedData = btoa(JSON.stringify(summaryData));
      const shareId = Math.random().toString(36).substr(2, 12);
      
      return {
        success: true,
        shareId,
        url: `${window.location.origin}/shared/${shareId}`,
        expiresIn: '24 hours'
      };
    } catch (error) {
      console.error('Link generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate Base network connection
  async validateNetwork() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
        
        // Base Mainnet: 0x2105, Base Testnet: 0x14a33
        const isBaseNetwork = chainId === '0x2105' || chainId === '0x14a33';
        
        return {
          success: true,
          isBaseNetwork,
          chainId,
          networkName: isBaseNetwork ? 'Base' : 'Other'
        };
      }
      
      return {
        success: true,
        isBaseNetwork: false,
        chainId: null,
        networkName: 'No wallet detected'
      };
    } catch (error) {
      console.error('Network validation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const baseIntegration = new BaseIntegration();

// Utility functions for Farcaster integration
export const farcasterUtils = {
  // Format Farcaster ID for display
  formatFarcasterId(id) {
    if (!id) return 'Not connected';
    return id.startsWith('fc_') ? id : `fc_${id}`;
  },

  // Generate Farcaster cast for health summary sharing
  generateHealthCast(summaryData) {
    const { symptoms, medications, records } = summaryData;
    
    return {
      text: `🏥 My HealthSync Summary\n\n📊 ${symptoms.length} symptoms tracked\n💊 ${medications.length} medications\n📋 ${records.length} health records\n\nManaging my health with @healthsync on Base! 🔵`,
      embeds: [],
      mentions: [],
      tags: ['health', 'base', 'web3']
    };
  },

  // Validate Farcaster ID format
  isValidFarcasterId(id) {
    return typeof id === 'string' && id.length > 0;
  }
};

// Export utility functions
export default {
  baseIntegration,
  farcasterUtils
};
