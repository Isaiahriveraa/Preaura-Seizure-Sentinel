import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Calendar,
  Clock,
  Activity,
  FileImage,
  FileText
} from "lucide-react";
import { type SeizureEvent, formatSeizureDate, getSeverityColor } from "@/data/mockPatients";
import jsPDF from 'jspdf';

interface EEGViewerProps {
  seizureEvent: SeizureEvent;
  patientName: string;
}

const EEGViewer: React.FC<EEGViewerProps> = ({ seizureEvent, patientName }) => {
  const [zoom, setZoom] = useState(1);
  const [showRaw, setShowRaw] = useState(true);
  const [showCleaned, setShowCleaned] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock EEG data for visualization
  const generateEEGData = (duration: number, isRaw: boolean = false) => {
    const sampleRate = 256; // Hz
    const channels = 8; // Number of EEG channels
    const samples = duration * sampleRate;
    const data: number[][] = [];

    for (let channel = 0; channel < channels; channel++) {
      const channelData: number[] = [];
      for (let i = 0; i < samples; i++) {
        let value = 0;
        
        // Base EEG activity (8-12 Hz alpha rhythm)
        value += Math.sin((i / sampleRate) * 2 * Math.PI * 10) * 20;
        
        // Add some theta (4-8 Hz) and beta (13-30 Hz) activity
        value += Math.sin((i / sampleRate) * 2 * Math.PI * 6) * 15;
        value += Math.sin((i / sampleRate) * 2 * Math.PI * 20) * 10;
        
        // Add seizure activity (high frequency spikes) during middle portion
        const seizureStart = samples * 0.3;
        const seizureEnd = samples * 0.7;
        if (i >= seizureStart && i <= seizureEnd) {
          value += Math.sin((i / sampleRate) * 2 * Math.PI * 40) * 50 * Math.random();
          value += Math.random() * 30 - 15; // Spike activity
        }
        
        // Add noise if raw data
        if (isRaw) {
          value += (Math.random() - 0.5) * 20;
        }
        
        channelData.push(value);
      }
      data.push(channelData);
    }
    
    return data;
  };

  // Draw EEG on canvas
  const drawEEG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200 * zoom;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rawData = generateEEGData(seizureEvent.duration, true);
    const cleanedData = generateEEGData(seizureEvent.duration, false);
    
    const channels = rawData.length;
    const channelHeight = canvas.height / channels;
    const samplesPerPixel = rawData[0].length / canvas.width;

    // Channel labels
    const channelLabels = ['Fp1-F7', 'F7-T3', 'T3-T5', 'T5-O1', 'Fp2-F8', 'F8-T4', 'T4-T6', 'T6-O2'];

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.beginPath();
    for (let i = 0; i <= channels; i++) {
      const y = i * channelHeight;
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    // Vertical lines every second
    for (let i = 0; i <= seizureEvent.duration; i++) {
      const x = (i / seizureEvent.duration) * canvas.width;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    ctx.stroke();

    // Draw channel labels
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    channelLabels.forEach((label, i) => {
      ctx.fillText(label, 5, i * channelHeight + 20);
    });

    // Draw time markers
    for (let i = 0; i <= seizureEvent.duration; i += 5) {
      const x = (i / seizureEvent.duration) * canvas.width;
      ctx.fillText(`${i}s`, x + 2, 15);
    }

    // Draw EEG data
    for (let channel = 0; channel < channels; channel++) {
      const centerY = channel * channelHeight + channelHeight / 2;
      
      // Draw raw data (black) if enabled
      if (showRaw) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x++) {
          const sampleIndex = Math.floor(x * samplesPerPixel);
          const value = rawData[channel][sampleIndex] || 0;
          const y = centerY - value * 0.8;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw cleaned data (red) if enabled
      if (showCleaned) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x++) {
          const sampleIndex = Math.floor(x * samplesPerPixel);
          const value = cleanedData[channel][sampleIndex] || 0;
          const y = centerY - value * 0.8;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }

    // Highlight seizure period
    const seizureStart = canvas.width * 0.3;
    const seizureEnd = canvas.width * 0.7;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(seizureStart, 0, seizureEnd - seizureStart, canvas.height);
    
    // Seizure marker
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('SEIZURE EVENT', seizureStart + 10, 30);
  };

  useEffect(() => {
    // Small delay to ensure canvas is properly mounted and sized
    const timer = setTimeout(() => {
      drawEEG();
    }, 10);
    
    return () => clearTimeout(timer);
  }, [zoom, showRaw, showCleaned, seizureEvent]);

  // Ensure initial render when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      drawEEG();
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = (format: 'png' | 'pdf' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'png') {
      // Export as PNG (original functionality)
      const link = document.createElement('a');
      link.download = `${patientName}_seizure_${seizureEvent.id}_eeg.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else {
      // Export as PDF with detailed report
      try {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPosition = 20;

        // Title
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('EEG Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Patient and seizure info
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Patient: ${patientName}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Date: ${formatSeizureDate(seizureEvent.date, seizureEvent.time)}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Duration: ${seizureEvent.duration} seconds`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Type: ${seizureEvent.type.toUpperCase()} seizure`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Severity: ${seizureEvent.severity.toUpperCase()}`, 20, yPosition);
        yPosition += 15;

        // EEG Image
        const canvasImg = canvas.toDataURL('image/png', 1.0);
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        
        pdf.text('EEG Waveforms:', 20, yPosition);
        yPosition += 10;
        pdf.addImage(canvasImg, 'PNG', 20, yPosition, imgWidth, Math.min(imgHeight, 120));
        yPosition += Math.min(imgHeight, 120) + 15;

        // Notes
        if (seizureEvent.notes) {
          pdf.setFont(undefined, 'bold');
          pdf.text('Clinical Notes:', 20, yPosition);
          yPosition += 8;
          pdf.setFont(undefined, 'normal');
          const lines = pdf.splitTextToSize(seizureEvent.notes, pageWidth - 40);
          pdf.text(lines, 20, yPosition);
          yPosition += lines.length * 6 + 10;
        }

        // Technical specifications
        pdf.setFont(undefined, 'bold');
        pdf.text('Technical Specifications:', 20, yPosition);
        yPosition += 8;
        pdf.setFont(undefined, 'normal');
        pdf.text('• Sampling Rate: 256 Hz', 25, yPosition);
        yPosition += 6;
        pdf.text('• Channels: 8 (Standard 10-20 electrode system)', 25, yPosition);
        yPosition += 6;
        pdf.text('• Filter: Raw and cleaned data visualization', 25, yPosition);
        yPosition += 6;
        pdf.text('• Analysis: Automated seizure pattern detection', 25, yPosition);
        yPosition += 15;

        // Disclaimer
        const disclaimerY = pdf.internal.pageSize.getHeight() - 20;
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.text('This EEG analysis is for informational purposes only. Please consult with a healthcare professional for medical interpretation.', pageWidth / 2, disclaimerY, { align: 'center' });

        // Save PDF
        pdf.save(`${patientName}_seizure_${seizureEvent.id}_eeg_report.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to PNG if PDF fails
        handleDownload('png');
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>EEG Analysis - {patientName}</span>
            </CardTitle>
            <CardDescription>
              {formatSeizureDate(seizureEvent.date, seizureEvent.time)} • 
              Duration: {seizureEvent.duration}s
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getSeverityColor(seizureEvent.severity)}>
              {seizureEvent.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {seizureEvent.type.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showRaw"
                checked={showRaw}
                onChange={(e) => setShowRaw(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showRaw" className="text-sm flex items-center space-x-1">
                <span className="w-4 h-0.5 bg-black"></span>
                <span>Raw EEG</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCleaned"
                checked={showCleaned}
                onChange={(e) => setShowCleaned(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showCleaned" className="text-sm flex items-center space-x-1">
                <span className="w-4 h-0.5 bg-red-600"></span>
                <span>Cleaned EEG</span>
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium px-3 py-1 bg-white rounded border">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(1)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('png')}
              title="Download EEG as PNG image"
            >
              <FileImage className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('pdf')}
              title="Download EEG report as PDF"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* EEG Canvas */}
        <div className="border rounded-lg overflow-x-auto bg-white">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ minWidth: '1200px' }}
          />
        </div>

        {/* Notes */}
        {seizureEvent.notes && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Clinical Notes</h4>
            <p className="text-blue-800 text-sm">{seizureEvent.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EEGViewer;
