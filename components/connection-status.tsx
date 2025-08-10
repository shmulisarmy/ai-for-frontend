"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"

const API_BASE = "https://scout-k9fna.sevalla.app" // Corrected base URL

type ConnectionStatus = "connecting" | "connected" | "error" | "cors-error" | "timeout"

interface PingResult {
  status: ConnectionStatus
  responseTime?: number
  error?: string
  timestamp: Date
}

export function ConnectionStatus() {
  const [pingResult, setPingResult] = useState<PingResult>({
    status: "connecting",
    timestamp: new Date(),
  })
  const [isManualPing, setIsManualPing] = useState(false)
  const [autoPing, setAutoPing] = useState(true)

  const pingBackend = async (isManual = false) => {
    if (isManual) setIsManualPing(true)

    const startTime = Date.now()

    try {
      setPingResult((prev) => ({ ...prev, status: "connecting" }))

      // Ping the Kanban board endpoint with /api
      const response = await fetch(`${API_BASE}/api/kanban/get_board`, {
        credentials: "include",
        method: "GET",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        setPingResult({
          status: "connected",
          responseTime,
          timestamp: new Date(),
        })
      } else {
        setPingResult({
          status: "error",
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date(),
        })
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime

      // Check for CORS error
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setPingResult({
          status: "cors-error",
          responseTime,
          error: "CORS Error: Backend needs to allow cross-origin requests",
          timestamp: new Date(),
        })
      } else if (error.name === "TimeoutError") {
        setPingResult({
          status: "timeout",
          responseTime,
          error: "Request timed out after 10 seconds",
          timestamp: new Date(),
        })
      } else {
        setPingResult({
          status: "error",
          responseTime,
          error: error.message || "Unknown error occurred",
          timestamp: new Date(),
        })
      }
    } finally {
      if (isManual) setIsManualPing(false)
    }
  }

  // Auto-ping every 30 seconds
  useEffect(() => {
    if (!autoPing) return

    // Initial ping
    pingBackend()

    const interval = setInterval(() => {
      pingBackend()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoPing])

  const getStatusColor = () => {
    switch (pingResult.status) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500 animate-pulse"
      case "cors-error":
        return "bg-orange-500"
      case "timeout":
        return "bg-red-400"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = () => {
    switch (pingResult.status) {
      case "connected":
        return <CheckCircle className="h-4 w-4" />
      case "connecting":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "cors-error":
        return <AlertCircle className="h-4 w-4" />
      case "timeout":
        return <Clock className="h-4 w-4" />
      case "error":
        return <WifiOff className="h-4 w-4" />
      default:
        return <Wifi className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (pingResult.status) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting..."
      case "cors-error":
        return "CORS Error"
      case "timeout":
        return "Timeout"
      case "error":
        return "Error"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>

            {pingResult.responseTime && (
              <Badge variant="outline" className="text-xs">
                {pingResult.responseTime}ms
              </Badge>
            )}

            <span className="text-xs text-muted-foreground">Last: {pingResult.timestamp.toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoPing(!autoPing)}
              className={autoPing ? "text-green-600" : "text-gray-400"}
            >
              Auto-ping {autoPing ? "ON" : "OFF"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pingBackend(true)}
              disabled={isManualPing}
              className="gap-2"
            >
              {isManualPing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
              Ping Now
            </Button>
          </div>
        </div>

        {/* Error Details */}
        {pingResult.error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Connection Error</p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">{pingResult.error}</p>

                {pingResult.status === "cors-error" && (
                  <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-800 dark:text-orange-200 font-medium">🔧 Backend Fix Needed:</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Add CORS headers to allow requests from this domain. In Go with Gin, use:{" "}
                      <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">
                        c.Header("Access-Control-Allow-Origin", "*")
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Details */}
        {pingResult.status === "connected" && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Backend is responding! Connection established to{" "}
                <code className="bg-green-100 dark:bg-green-900 px-1 rounded text-xs">{API_BASE}/api</code>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
