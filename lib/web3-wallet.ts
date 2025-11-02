// Web3 Wallet Integration for NodeOps
// Handles MetaMask, WalletConnect, and other Web3 wallet connections

export interface WalletConnection {
  address: string
  provider: string
  chainId: number
  networkName: string
  isPrimary: boolean
  signature?: string
}

export interface Web3Activity {
  type: 'transaction' | 'nft_purchase' | 'defi_interaction' | 'social_share'
  description: string
  points: number
  transactionHash?: string
  chainId?: number
  contractAddress?: string
  tokenAmount?: number
  tokenSymbol?: string
  usdValue?: number
  metadata?: any
}

class Web3WalletManager {
  private connectedWallets: Map<string, WalletConnection> = new Map()

  // Check if MetaMask is available
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && window.ethereum?.isMetaMask
  }

  // Check if WalletConnect is available
  isWalletConnectAvailable(): boolean {
    return typeof window !== 'undefined' && window.ethereum?.isWalletConnect
  }

  // Connect MetaMask wallet
  async connectMetaMask(): Promise<WalletConnection> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not installed')
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]

      // Get network information
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const networkName = this.getNetworkName(parseInt(chainId, 16))

      // Create signature for verification
      const message = `Connect to NodeOps at ${new Date().toISOString()}`
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      })

      const connection: WalletConnection = {
        address,
        provider: 'metamask',
        chainId: parseInt(chainId, 16),
        networkName,
        isPrimary: true,
        signature,
      }

      this.connectedWallets.set(address, connection)
      return connection
    } catch (error: any) {
      throw new Error(`MetaMask connection failed: ${error.message}`)
    }
  }

  // Connect WalletConnect wallet
  async connectWalletConnect(): Promise<WalletConnection> {
    // This would require WalletConnect SDK integration
    // For now, return a placeholder
    throw new Error('WalletConnect integration coming soon')
  }

  // Switch network
  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No Web3 provider available')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await this.addNetwork(chainId)
      } else {
        throw error
      }
    }
  }

  // Add network to wallet
  private async addNetwork(chainId: number): Promise<void> {
    const networkParams = this.getNetworkParams(chainId)
    if (!networkParams) {
      throw new Error(`Network ${chainId} not supported`)
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkParams],
    })
  }

  // Get network name from chain ID
  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'ethereum',
      5: 'goerli',
      11155111: 'sepolia',
      137: 'polygon',
      80001: 'polygon-mumbai',
      56: 'bsc',
      97: 'bsc-testnet',
      43114: 'avalanche',
      43113: 'avalanche-fuji',
    }
    return networks[chainId] || 'unknown'
  }

  // Get network parameters for adding to wallet
  private getNetworkParams(chainId: number): any {
    const networks: Record<number, any> = {
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com/'],
      },
      56: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/'],
      },
    }
    return networks[chainId]
  }

  // Sign message for verification
  async signMessage(message: string, address: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('No Web3 provider available')
    }

    return await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    })
  }

  // Verify signature
  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    // This would require a library like ethers.js for proper verification
    // For now, return true as a placeholder
    return true
  }

  // Get connected wallets
  getConnectedWallets(): WalletConnection[] {
    return Array.from(this.connectedWallets.values())
  }

  // Disconnect wallet
  disconnectWallet(address: string): void {
    this.connectedWallets.delete(address)
  }

  // Listen for account changes
  onAccountChange(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback)
    }
  }

  // Listen for network changes
  onNetworkChange(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback)
    }
  }

  // Clean up event listeners
  removeListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', () => {})
      window.ethereum.removeListener('chainChanged', () => {})
    }
  }
}

// Global Web3 wallet manager instance
export const web3Wallet = new Web3WalletManager()

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
