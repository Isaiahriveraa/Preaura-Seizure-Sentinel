import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Download, Filter, AlertTriangle, Activity } from "lucide-react"
import { BiosensorReading } from "@/hooks/useBiosensorData"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SeizureEvent {
  id: string
  timestamp: string
  risk_level: number
  alert_triggered: boolean
  notes?: string
}

export default function History() {
  const { user } = useAuth()
  const [readings, setReadings] = useState<BiosensorReading[]>([])
  const [seizureEvents, setSeizureEvents] = useState<SeizureEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState("")
  const [riskFilter, setRiskFilter] = useState("")

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    
    try {
      // Load biosensor readings
      const { data: readingsData, error: readingsError } = await supabase
        .from('biosensor_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000)

      if (readingsError) throw readingsError

      // Load seizure events
      const { data: eventsData, error: eventsError } = await supabase
        .from('seizure_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (eventsError) throw eventsError

      // Transform database readings to match BiosensorReading interface
      const transformedReadings = (readingsData || []).map(reading => ({
        timestamp: new Date(reading.timestamp).getTime(),
        heartRate: reading.heart_rate,
        skinTemp: reading.skin_temp,
        eda: reading.eda,
        seizureRisk: reading.seizure_risk
      }))
      setReadings(transformedReadings)
      setSeizureEvents(eventsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReadings = readings.filter(reading => {
    const dateMatch = !dateFilter || new Date(reading.timestamp).toDateString().includes(dateFilter)
    const riskMatch = !riskFilter || reading.seizureRisk >= parseFloat(riskFilter)
    return dateMatch && riskMatch
  })

  const exportData = () => {
    const csvContent = [
      ['Timestamp', 'Heart Rate', 'Skin Temp', 'EDA', 'Seizure Risk'].join(','),
      ...filteredReadings.map(reading => [
        new Date(reading.timestamp).toISOString(),
        reading.heartRate,
        reading.skinTemp,
        reading.eda,
        reading.seizureRisk
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biosensor-data-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "destructive"
    if (risk >= 40) return "destructive"
    return "secondary"
  }

  const chartData = filteredReadings.slice(0, 100).reverse().map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString(),
    heartRate: reading.heartRate,
    seizureRisk: reading.seizureRisk,
    skinTemp: reading.skinTemp,
    eda: reading.eda
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Data History</h1>
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readings.length.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Seizure Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{seizureEvents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {readings.length > 0 
                  ? (readings.reduce((sum, r) => sum + r.seizureRisk, 0) / readings.length).toFixed(1)
                  : '0'}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {readings.length > 0 
                  ? new Date(readings[0].timestamp).toLocaleString()
                  : 'No data'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Trends</CardTitle>
              <CardDescription>Last 100 readings visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="seizureRisk" stroke="hsl(var(--destructive))" name="Seizure Risk %" />
                    <Line type="monotone" dataKey="heartRate" stroke="hsl(var(--primary))" name="Heart Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-filter">Date Filter</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-filter">Minimum Risk Level</Label>
                <Input
                  id="risk-filter"
                  type="number"
                  placeholder="e.g. 50"
                  min="0"
                  max="100"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seizure Events */}
        {seizureEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Seizure Events
              </CardTitle>
              <CardDescription>High-risk alerts and predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Alert Triggered</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seizureEvents.slice(0, 10).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getRiskColor(event.risk_level)}>
                          {event.risk_level.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.alert_triggered ? "destructive" : "secondary"}>
                          {event.alert_triggered ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Biosensor Readings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Biosensor Readings</CardTitle>
            <CardDescription>
              Showing {filteredReadings.length} of {readings.length} total readings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReadings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No data found matching your filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Heart Rate</TableHead>
                    <TableHead>Skin Temp</TableHead>
                    <TableHead>EDA</TableHead>
                    <TableHead>Seizure Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadings.slice(0, 50).map((reading, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(reading.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{reading.heartRate.toFixed(1)} bpm</TableCell>
                      <TableCell>{reading.skinTemp.toFixed(1)}°C</TableCell>
                      <TableCell>{reading.eda.toFixed(2)} μS</TableCell>
                      <TableCell>
                        <Badge variant={getRiskColor(reading.seizureRisk)}>
                          {reading.seizureRisk.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}