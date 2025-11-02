"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Unlink, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { web3Wallet, WalletConnection } from "@/lib/web3-wallet"
import { connectWallet, disconnectWallet, getUserWallets } from "@/app/actions/mindshare"
import { useToast } from "@/hooks/use-toast"

interface WalletConnectionProps {
  userId: string
  onWalletConnected?: (wallet: WalletConnection) => void
  onWalletDisconnected?: (address: string) => void
}

export function WalletConnection({ userId, onWalletConnected, onWalletDisconnected }: WalletConnectionProps) {
  const [connectedWallets, setConnectedWallets] = useState<WalletConnection[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Memoized function to load connected wallets
  const loadConnectedWallets = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)
      const result = await getUserWallets(userId)
      if (result.error) {
        console.error("Failed to load wallets:", result.error)
        setError("Failed to load connected wallets")
      } else {
        // Transform Supabase data to WalletConnection format
        const wallets: WalletConnection[] = result.data?.map((wallet: any) => ({
          address: wallet.wallet_address,
          provider: wallet.wallet_provider,
          chainId: wallet.chain_id,
          networkName: wallet.network_name,
          isPrimary: wallet.is_primary,
          signature: wallet.signature,
        })) || []
        setConnectedWallets(wallets)
      }
    } catch (err: any) {
      console.error("Error loading wallets:", err)
      setError("Failed to load connected wallets")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Load connected wallets on mount and when userId changes
  useEffect(() => {
    loadConnectedWallets()
  }, [loadConnectedWallets])

  const handleConnectMetaMask = async () => {
    if (!web3Wallet.isMetaMaskAvailable()) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask extension to connect your wallet.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      // Connect via Web3 wallet manager
      const walletConnection = await web3Wallet.connectMetaMask()

      // Save to backend/Supabase
      const result = await connectWallet({
        userId,
        walletAddress: walletConnection.address,
        walletProvider: walletConnection.provider,
        chainId: walletConnection.chainId,
        networkName: walletConnection.networkName,
        isPrimary: walletConnection.isPrimary,
        signature: walletConnection.signature,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state - prevent duplicates
      setConnectedWallets(prev => {
        const exists = prev.some(w => w.address === walletConnection.address)
        if (exists) return prev
        return [...prev, walletConnection]
      })

      toast({
        title: "Wallet connected",
        description: `Successfully connected ${walletConnection.address.slice(0, 6)}...${walletConnection.address.slice(-4)}`,
      })

      onWalletConnected?.(walletConnection)
    } catch (err: any) {
      console.error("Failed to connect wallet:", err)
      setError(err.message || "Failed to connect wallet")
      toast({
        title: "Connection failed",
        description: err.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectWallet = async (address: string) => {
    try {
      const result = await disconnectWallet(userId, address)
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setConnectedWallets(prev => prev.filter(wallet => wallet.address !== address))
      web3Wallet.disconnectWallet(address)

      toast({
        title: "Wallet disconnected",
        description: `Disconnected ${address.slice(0, 6)}...${address.slice(-4)}`,
      })

      onWalletDisconnected?.(address)
    } catch (err: any) {
      console.error("Failed to disconnect wallet:", err)
      toast({
        title: "Disconnection failed",
        description: err.message || "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkColor = (networkName: string) => {
    const colors: Record<string, string> = {
      ethereum: "bg-blue-500",
      polygon: "bg-purple-500",
      bsc: "bg-yellow-500",
      avalanche: "bg-red-500",
      sepolia: "bg-gray-500",
      "polygon-mumbai": "bg-pink-500",
    }
    return colors[networkName] || "bg-gray-500"
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="ml-2 text-slate-300">Loading wallets...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            Web3 Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your Web3 wallet to participate in the ambassador program and earn points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Connect Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleConnectMetaMask}
              disabled={isConnecting}
              className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </div>

          {/* Connected Wallets */}
          {connectedWallets.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Connected Wallets</h4>
              {connectedWallets.map((wallet) => (
                <motion.div
                  key={wallet.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getNetworkColor(wallet.networkName)}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{formatAddress(wallet.address)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                          {wallet.provider}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-cyan-600/30 text-cyan-300">
                          {wallet.networkName}
                        </Badge>
                        {wallet.isPrimary && (
                          <Badge className="text-xs bg-emerald-600/30 text-emerald-300">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnectWallet(wallet.address)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Unlink className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {connectedWallets.length === 0 && !isConnecting && (
            <div className="text-center py-8 text-slate-400">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No wallets connected yet</p>
              <p className="text-sm">Connect your wallet to start earning ambassador points</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
