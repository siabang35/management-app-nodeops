"use client"

import type React from "react"
import { useEffect, useState, useMemo, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { getTopAmbassadors, type Ambassador, updateAmbassadorPoints, subscribeToMindshareUpdates } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Users, TrendingUp, Edit, Search, Filter } from "lucide-react"
import { toast } from "sonner"

const ModeratorDashboard: React.FC = () => {
  // const { user, moderator, isModerator } = useAuth()
  const { moderator, isModerator } = useAuth()
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [filteredAmbassadors, setFilteredAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null)
  const [pointsAdjustment, setPointsAdjustment] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const subscriptionRef = useRef<any>(null)

  // Memoized statistics
  const stats = useMemo(() => {
    const totalAmbassadors = ambassadors.length
    const totalPoints = ambassadors.reduce((sum, amb) => sum + amb.points, 0)
    const avgMindshare =
      totalAmbassadors > 0 ? ambassadors.reduce((sum, amb) => sum + amb.mindshare_score, 0) / totalAmbassadors : 0
    const activeAmbassadors = ambassadors.filter((amb) => amb.tasks_completed > 0).length

    return { totalAmbassadors, totalPoints, avgMindshare, activeAmbassadors }
  }, [ambassadors])

  useEffect(() => {
    if (!isModerator) {
      toast.error("Access denied. Moderator role required.")
      return
    }

    const fetchData = async () => {
      try {
        const data = await getTopAmbassadors(100) // Get more for moderation
        setAmbassadors(data)
        setFilteredAmbassadors(data)
      } catch (error) {
        console.error("Error fetching ambassadors:", error)
        toast.error("Failed to load ambassador data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to real-time updates
    try {
      subscriptionRef.current = subscribeToMindshareUpdates((payload) => {
        console.log("Mindshare update:", payload)
        fetchData() // Refresh data on updates
      })
    } catch (error) {
      console.error("Error subscribing to updates:", error)
    }

    return () => {
      if (subscriptionRef.current?.unsubscribe) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [isModerator])

  // Filter ambassadors based on search term
  useEffect(() => {
    const filtered = ambassadors.filter(
      (amb) =>
        amb.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        amb.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAmbassadors(filtered)
  }, [ambassadors, searchTerm])

  const handlePointsAdjustment = async () => {
    if (!selectedAmbassador || !pointsAdjustment) return

    try {
      const newPoints = selectedAmbassador.points + Number.parseInt(pointsAdjustment)
      const success = await updateAmbassadorPoints(selectedAmbassador.id, newPoints)

      if (success) {
        toast.success(`Points updated successfully. New total: ${newPoints}`)
        setDialogOpen(false)
        setSelectedAmbassador(null)
        setPointsAdjustment("")
        setAdjustmentReason("")

        // Refresh data
        const data = await getTopAmbassadors(100)
        setAmbassadors(data)
      } else {
        toast.error("Failed to update points")
      }
    } catch (error) {
      console.error("Error updating points:", error)
      toast.error("An error occurred while updating points")
    }
  }

  // const handleDialogOpenChange = (open) => {
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedAmbassador(null)
      setPointsAdjustment("")
      setAdjustmentReason("")
    }
  }

  if (!isModerator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <p className="text-sm text-muted-foreground">You need moderator privileges to access this dashboard.</p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Shield className="w-5 h-5 mr-2" />
          Moderator
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ambassadors">Manage Ambassadors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ambassadors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAmbassadors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Mindshare</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgMindshare.toFixed(1)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Ambassadors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAmbassadors}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ambassadors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ambassador Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage ambassador points and data</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or wallet address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Mindshare</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAmbassadors.map((ambassador) => (
                    <TableRow key={ambassador.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ambassador.email}`} />
                            <AvatarFallback>{ambassador.email.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{ambassador.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {ambassador.wallet_address.slice(0, 6)}...{ambassador.wallet_address.slice(-4)}
                      </TableCell>
                      <TableCell>{ambassador.points}</TableCell>
                      <TableCell>{ambassador.mindshare_score}</TableCell>
                      <TableCell>{ambassador.tasks_completed}</TableCell>
                      <TableCell>
                        <Dialog
                          open={dialogOpen && selectedAmbassador?.id === ambassador.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setSelectedAmbassador(ambassador)
                              setDialogOpen(true)
                            } else {
                              handleDialogOpenChange(false)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Adjust Points
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adjust Points for {selectedAmbassador?.email}</DialogTitle>
                              <DialogDescription>Current points: {selectedAmbassador?.points}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="points">Points Adjustment</Label>
                                <Input
                                  id="points"
                                  type="number"
                                  placeholder="Enter positive or negative number"
                                  value={pointsAdjustment}
                                  onChange={(e) => setPointsAdjustment(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Reason for points adjustment..."
                                  value={adjustmentReason}
                                  onChange={(e) => setAdjustmentReason(e.target.value)}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button onClick={handlePointsAdjustment} disabled={!pointsAdjustment}>
                                  Update Points
                                </Button>
                                <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground">Detailed analytics and insights</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Advanced analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ModeratorDashboard
