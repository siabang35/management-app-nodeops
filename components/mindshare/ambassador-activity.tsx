"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  Plus,
  TrendingUp,
  Coins,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { createAmbassadorActivity, getAmbassadorProfile } from "@/app/actions/mindshare"
import { useToast } from "@/hooks/use-toast"

interface AmbassadorActivityProps {
  userId: string
  wallets: Array<{ address: string; networkName: string }>
}

interface ActivityItem {
  id: string
  activity_type: string
  activity_description: string
  points_earned: number
  transaction_hash?: string
  chain_id?: number
  contract_address?: string
  token_amount?: number
  token_symbol?: string
  usd_value?: number
  created_at: string
}

export function AmbassadorActivity({ userId, wallets }: AmbassadorActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    walletAddress: "",
    activityType: "",
    description: "",
    pointsEarned: "",
    transactionHash: "",
    chainId: "",
    contractAddress: "",
    tokenAmount: "",
    tokenSymbol: "",
    usdValue: "",
  })

  // Load activities on mount
  useEffect(() => {
    loadActivities()
  }, [userId])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const result = await getAmbassadorProfile(userId)
      if (result.error) {
        console.error("Failed to load activities:", result.error)
        setError("Failed to load ambassador activities")
      } else {
        setActivities(result.data?.mindshare_activities || [])
      }
    } catch (err: any) {
      console.error("Error loading activities:", err)
      setError("Failed to load ambassador activities")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.walletAddress || !formData.activityType || !formData.description || !formData.pointsEarned) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const activityData = {
        userId,
        walletAddress: formData.walletAddress,
        activityType: formData.activityType,
        description: formData.description,
        pointsEarned: parseInt(formData.pointsEarned),
        transactionHash: formData.transactionHash || undefined,
        chainId: formData.chainId ? parseInt(formData.chainId) : undefined,
        contractAddress: formData.contractAddress || undefined,
        tokenAmount: formData.tokenAmount ? parseFloat(formData.tokenAmount) : undefined,
        tokenSymbol: formData.tokenSymbol || undefined,
        usdValue: formData.usdValue ? parseFloat(formData.usdValue) : undefined,
      }

      const result = await createAmbassadorActivity(activityData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Reset form
      setFormData({
        walletAddress: "",
        activityType: "",
        description: "",
        pointsEarned: "",
        transactionHash: "",
        chainId: "",
        contractAddress: "",
        tokenAmount: "",
        tokenSymbol: "",
        usdValue: "",
      })
      setShowForm(false)

      // Reload activities
      await loadActivities()

      toast({
        title: "Activity logged",
        description: `Earned ${activityData.pointsEarned} points for ${activityData.activityType}`,
      })
    } catch (err: any) {
      console.error("Failed to submit activity:", err)
      setError(err.message || "Failed to submit activity")
      toast({
        title: "Submission failed",
        description: err.message || "Failed to submit activity",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <Coins className="w-4 h-4" />
      case "nft_purchase":
        return <Activity className="w-4 h-4" />
      case "defi_interaction":
        return <TrendingUp className="w-4 h-4" />
      case "social_share":
        return <ExternalLink className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "transaction":
        return "text-green-400"
      case "nft_purchase":
        return "text-purple-400"
      case "defi_interaction":
        return "text-blue-400"
      case "social_share":
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPoints = activities.reduce((sum, activity) => sum + activity.points_earned, 0)

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="ml-2 text-slate-300">Loading activities...</span>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Ambassador Activities
              </CardTitle>
              <CardDescription>
                Track your Web3 activities and earned points
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {totalPoints.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Total Points</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Add Activity Button */}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log New Activity
          </Button>

          {/* Activity Form */}
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmitActivity}
              className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="walletAddress">Wallet Address *</Label>
                  <Select
                    value={formData.walletAddress}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, walletAddress: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.address} value={wallet.address}>
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} ({wallet.networkName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="activityType">Activity Type *</Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, activityType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="nft_purchase">NFT Purchase</SelectItem>
                      <SelectItem value="defi_interaction">DeFi Interaction</SelectItem>
                      <SelectItem value="social_share">Social Share</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the activity"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pointsEarned">Points Earned *</Label>
                  <Input
                    id="pointsEarned"
                    type="number"
                    value={formData.pointsEarned}
                    onChange={(e) => setFormData(prev => ({ ...prev, pointsEarned: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="transactionHash">Transaction Hash</Label>
                  <Input
                    id="transactionHash"
                    value={formData.transactionHash}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionHash: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <Label htmlFor="chainId">Chain ID</Label>
                  <Input
                    id="chainId"
                    type="number"
                    value={formData.chainId}
                    onChange={(e) => setFormData(prev => ({ ...prev, chainId: e.target.value }))}
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="contractAddress">Contract Address</Label>
                  <Input
                    id="contractAddress"
                    value={formData.contractAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractAddress: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <Label htmlFor="tokenAmount">Token Amount</Label>
                  <Input
                    id="tokenAmount"
                    type="number"
                    step="0.000001"
                    value={formData.tokenAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenAmount: e.target.value }))}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="tokenSymbol">Token Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="ETH"
                  />
                </div>

                <div>
                  <Label htmlFor="usdValue">USD Value</Label>
                  <Input
                    id="usdValue"
                    type="number"
                    step="0.01"
                    value={formData.usdValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, usdValue: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Activity
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}

          {/* Activities List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activities logged yet</p>
                <p className="text-sm">Start logging your Web3 activities to earn points</p>
              </div>
            ) : (
              activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                >
                  <div className={`p-2 rounded-lg bg-slate-600/50 ${getActivityColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-slate-400">{formatDate(activity.created_at)}</span>
                    </div>
                    <p className="text-sm text-white mb-2">{activity.activity_description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        {activity.transaction_hash && (
                          <a
                            href={`https://etherscan.io/tx/${activity.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-cyan-400"
                          >
                            <ExternalLink className="w-3 h-3" />
                            TX
                          </a>
                        )}
                        {activity.token_amount && activity.token_symbol && (
                          <span>{activity.token_amount} {activity.token_symbol}</span>
                        )}
                        {activity.usd_value && (
                          <span>${activity.usd_value.toFixed(2)}</span>
                        )}
                      </div>
                      <Badge className="bg-emerald-600/30 text-emerald-300">
                        +{activity.points_earned} pts
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
