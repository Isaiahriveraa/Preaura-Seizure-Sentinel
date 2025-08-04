import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  RotateCcw,
  Activity,
  Brain,
  Clock,
  AlertTriangle
} from "lucide-react";
import { type EEGData } from "@/lib/eegGenerator";

interface EEGModalProps {
  isOpen: boolean;
  onClose: () => void;
  eegData: EEGData | null;
  seizureInfo?: {
    timestamp: string;
    duration: number;
    severity: number;
    notes?: string;
  };
}

export const EEGModal: React.FC<EEGModalProps> = ({ 
  isOpen, 
  onClose, 
  eegData, 
  seizureInfo 
}) => {
  // Medical Standard: Raw EEG data should display by default
  const [showRawData, setShowRawData] = useState(true);  // ✅ Default to true per medical standards
  const [showCleanedData, setShowCleanedData] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeOffset, setTimeOffset] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isOpen && eegData && canvasRef.current) {
      drawEEG();
    }
  }, [isOpen, eegData, showRawData, showCleanedData, zoomLevel, timeOffset]);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= (eegData?.duration || 0)) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, eegData?.duration]);

  const drawEEG = () => {
    const canvas = canvasRef.current;
    if (!canvas || !eegData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    // Clear canvas with white background (medical standard)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Don't render if neither data type is selected
    if (!showRawData && !showCleanedData) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Select Raw or Cleaned data to view EEG', canvasWidth / 2, canvasHeight / 2);
      return;
    }

    const channels = eegData.channels;
    const channelHeight = canvasHeight / channels.length;
    const samplingRate = eegData.samplingRate;
    
    // Calculate visible time window based on zoom
    const visibleDuration = 10 / zoomLevel; // 10 seconds at 1x zoom
    const startTime = timeOffset;
    const endTime = Math.min(startTime + visibleDuration, eegData.duration);
    
    const startSample = Math.floor(startTime * samplingRate);
    const endSample = Math.floor(endTime * samplingRate);
    const samplesPerPixel = (endSample - startSample) / canvasWidth;

    console.log('🎨 Drawing EEG:', {
      channels: channels.length,
      visibleDuration,
      startTime,
      endTime,
      samplesRange: [startSample, endSample],
      showRawData,
      showCleanedData
    });

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    // Horizontal lines (channel separators)
    for (let i = 0; i <= channels.length; i++) {
      const y = i * channelHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
    
    // Vertical lines (time markers)
    const timeStep = Math.max(1, Math.floor(visibleDuration / 10));
    for (let t = Math.ceil(startTime); t <= endTime; t += timeStep) {
      const x = ((t - startTime) / visibleDuration) * canvasWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Draw channel labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    channels.forEach((channel, channelIndex) => {
      const y = channelIndex * channelHeight + channelHeight / 2;
      ctx.fillText(channel, 5, y + 4);
    });

    // Draw EEG waveforms
    channels.forEach((channel, channelIndex) => {
      const baseY = (channelIndex + 0.5) * channelHeight;
      const amplitudeScale = channelHeight * 0.3 / 100; // Scale for µV

      // Draw raw data (black)
      if (showRawData) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        let isFirstPoint = true;
        for (let sample = startSample; sample < endSample; sample += Math.max(1, Math.floor(samplesPerPixel))) {
          if (sample >= eegData.data.length) break;
          
          const dataPoint = eegData.data[sample];
          const value = dataPoint?.channels[channel] || 0;
          const x = ((sample - startSample) / samplesPerPixel);
          const y = baseY - (value * amplitudeScale);
          
          if (isFirstPoint) {
            ctx.moveTo(x, y);
            isFirstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw cleaned data (red) if available and selected
      if (showCleanedData && eegData.data.length > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        let isFirstPoint = true;
        for (let sample = startSample; sample < endSample; sample += Math.max(1, Math.floor(samplesPerPixel))) {
          if (sample >= eegData.data.length) break;
          
          const dataPoint = eegData.data[sample];
          // Apply simple filtering for cleaned data visualization
          const rawValue = dataPoint?.channels[channel] || 0;
          const cleanedValue = rawValue * 0.9; // Simulate filtering
          const x = ((sample - startSample) / samplesPerPixel);
          const y = baseY - (cleanedValue * amplitudeScale);
          
          if (isFirstPoint) {
            ctx.moveTo(x, y);
            isFirstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    });

    // Draw playback cursor
    if (isPlaying) {
      const cursorX = ((currentTime - startTime) / visibleDuration) * canvasWidth;
      if (cursorX >= 0 && cursorX <= canvasWidth) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cursorX, 0);
        ctx.lineTo(cursorX, canvasHeight);
        ctx.stroke();
      }
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 2, 8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 2, 0.5));
  const handlePlayPause = () => setIsPlaying(prev => !prev);
  const handleReset = () => {
    setZoomLevel(1);
    setTimeOffset(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleExport = () => {
    if (!eegData) return;
    
    const exportData = {
      seizureInfo,
      eegData: {
        ...eegData,
        // Only export visible data to reduce file size
        data: eegData.data.slice(0, 1000) // First 1000 samples
      },
      exportTimestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eeg_${eegData.seizureId}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSeverityBadge = (severity: number) => {
    if (severity <= 3) return <Badge className="bg-green-100 text-green-800">Mild</Badge>;
    if (severity <= 7) return <Badge className="bg-orange-100 text-orange-800">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-800">Severe</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>EEG Viewer - Seizure Analysis</span>
          </DialogTitle>
          <DialogDescription>
            Professional EEG visualization with multi-channel waveform analysis
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(90vh-100px)]">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            {/* Seizure Information */}
            {seizureInfo && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Seizure Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Timestamp</p>
                      <p className="text-sm font-medium">
                        {formatTimestamp(seizureInfo.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium">{seizureInfo.duration}s</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Severity</p>
                      {getSeverityBadge(seizureInfo.severity)}
                    </div>
                  </div>

                  {seizureInfo.notes && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm">{seizureInfo.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* EEG Technical Info */}
            {eegData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">EEG Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Sampling Rate:</span> {eegData.samplingRate} Hz
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Channels:</span> {eegData.channels.length}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Duration:</span> {eegData.duration}s
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Data Points:</span> {eegData.data.length.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Display Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Display Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRawData}
                      onChange={(e) => setShowRawData(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Raw EEG Data</span>
                    <div className="w-4 h-2 bg-black"></div>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCleanedData}
                      onChange={(e) => setShowCleanedData(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Cleaned Data</span>
                    <div className="w-4 h-2 bg-red-500"></div>
                  </label>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Zoom Level: {zoomLevel}x</p>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={handleZoomOut}>
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleZoomIn}>
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button size="sm" variant="outline" onClick={handlePlayPause} className="w-full">
                    {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <Button size="sm" variant="outline" onClick={handleExport} className="w-full">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* EEG Canvas */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    EEG Waveforms - {eegData?.channels.length || 0} Channels
                  </CardTitle>
                  <div className="text-xs text-gray-500">
                    {showRawData && 'Raw Data'} {showRawData && showCleanedData && '+ '}
                    {showCleanedData && 'Cleaned Data'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full border border-gray-200 rounded"
                  style={{ cursor: 'crosshair' }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
