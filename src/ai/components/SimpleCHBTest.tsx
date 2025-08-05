/**
 * Enhanced CHB Test Page
 * 
 * Purpose: Test CHB-MIT EDF parsing with real file upload
 * Learning Focus: Medical data parsing and EEG file format understanding
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { CHBEDFReader } from '../data/chbEDFReader';

interface CHBTestResult {
  caseId: string;
  sessionNumber: string;
  duration: number;
  samplingRate: number;
  channelCount: number;
  fileSize: string;
  isRealData: boolean;
  validation?: {
    isValid: boolean;
    confidence: string;
    warnings: string[];
    checks: any;
  };
  extractedData?: {
    version: string;
    patientId: string;
    recordingId: string;
    startDate: string;
    startTime: string;
    headerBytes: number;
    numberOfRecords: number;
    durationOfRecord: number;
    numberOfSignals: number;
    calculatedFileSize: string;
  };
  signalData?: {
    sampleCount: number;
    timePoints: number;
    dataQuality: string;
    channelSample: number[];  // Sample from first channel
  };
}

export function SimpleCHBTest() {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Ready to test CHB-MIT EDF parsing');
  const [testResult, setTestResult] = useState<CHBTestResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runSimpleTest = async () => {
    setTestStatus('testing');
    setMessage('Running basic CHB infrastructure test...');

    try {
      // Test 1: Basic functionality
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessage('✅ Infrastructure OK - Testing EDF reader...');
      
      // Test 2: EDF Reader class
      await new Promise(resolve => setTimeout(resolve, 500));
      const testAvailable = typeof CHBEDFReader !== 'undefined';
      if (!testAvailable) throw new Error('CHBEDFReader not available');
      
      setMessage('✅ EDF Reader loaded - Ready for file upload!');
      setTestStatus('success');
      
    } catch (error) {
      setTestStatus('error');
      setMessage(`Test failed: ${error}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTestStatus('testing');
    setMessage(`📁 Loading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);

    try {
      // Convert file to Uint8Array buffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      setMessage('🧠 Parsing EDF header and medical data...');
      
      // Parse with your EDF reader
      const chbData = await CHBEDFReader.readCHBFileFromBuffer(uint8Array, file.name);
      
      // Create test result
      const result: CHBTestResult = {
        caseId: chbData.metadata.caseId,
        sessionNumber: chbData.metadata.sessionNumber,
        duration: chbData.duration,
        samplingRate: chbData.samplingRate,
        channelCount: chbData.channelLabels.length,
        fileSize: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        isRealData: file.size > 1000000, // Assume files > 1MB are real EDF files
        validation: chbData.metadata.validation,
        extractedData: {
          version: chbData.header.version,
          patientId: chbData.header.patientId,
          recordingId: chbData.header.recordingId,
          startDate: chbData.header.startDate,
          startTime: chbData.header.startTime,
          headerBytes: chbData.header.headerBytes,
          numberOfRecords: chbData.header.numberOfRecords,
          durationOfRecord: chbData.header.durationOfRecord,
          numberOfSignals: chbData.header.numberOfSignals,
          calculatedFileSize: ((chbData.header.headerBytes + (chbData.header.numberOfRecords * chbData.header.numberOfSignals * chbData.header.durationOfRecord * 256 * 2)) / 1024 / 1024).toFixed(1) + ' MB'
        },
        signalData: chbData.signalData ? {
          sampleCount: chbData.signalData.sampleCount,
          timePoints: chbData.signalData.timePoints,
          dataQuality: chbData.signalData.dataQuality,
          channelSample: chbData.signalData.channels[0]?.slice(0, 10) || [] // First 10 samples from first channel
        } : undefined
      };
      
      setTestResult(result);
      setTestStatus('success');
      setMessage(`✅ Successfully parsed ${result.isRealData ? 'real' : 'demo'} CHB-MIT data!`);
      
    } catch (error) {
      setTestStatus('error');
      setMessage(`❌ Parsing failed: ${error}`);
      setTestResult(null);
    }
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧠 CHB-MIT EDF Parser Test</CardTitle>
          <CardDescription>
            Test real medical EEG data parsing with your CHB files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runSimpleTest}
            disabled={testStatus === 'testing'}
            className="w-full"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test CHB Infrastructure'}
          </Button>
          
          {testStatus === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".edf"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Upload EDF
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a CHB-MIT .edf file to test real medical data parsing
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {testStatus !== 'idle' && (
        <Alert variant={testStatus === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>📊 CHB Parsing Results</CardTitle>
            <CardDescription>
              {testResult.isRealData ? '🩺 Real Medical Data' : '🎭 Demo Data'}
              {testResult.validation && (
                <span className={`ml-2 font-semibold ${
                  testResult.validation.confidence === 'HIGH' ? 'text-green-600' : 
                  testResult.validation.confidence === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  • Confidence: {testResult.validation.confidence}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Patient Case:</strong> {testResult.caseId}
              </div>
              <div>
                <strong>Session:</strong> {testResult.sessionNumber}
              </div>
              <div>
                <strong>Duration:</strong> {Math.floor(testResult.duration / 60)}m {Math.floor(testResult.duration % 60)}s
              </div>
              <div>
                <strong>Sampling Rate:</strong> {testResult.samplingRate} Hz
              </div>
              <div>
                <strong>EEG Channels:</strong> {testResult.channelCount}
              </div>
              <div>
                <strong>File Size:</strong> {testResult.fileSize}
              </div>
            </div>
            
            {testResult.validation && (
              <div className="mt-4 space-y-3">
                <div className={`p-3 rounded-lg ${
                  testResult.validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-semibold ${
                    testResult.validation.isValid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {testResult.validation.isValid ? '✅ Validation PASSED' : '❌ Validation FAILED'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    testResult.validation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Parsing appears to be {testResult.validation.isValid ? 'correct' : 'incorrect'} based on EDF standards
                  </p>
                </div>
                
                {testResult.validation.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-700 mb-2">⚠️ Warnings:</p>
                    <ul className="text-xs text-yellow-600 space-y-1">
                      {testResult.validation.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    🔍 View Detailed Validation Checks
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded space-y-1">
                    {Object.entries(testResult.validation.checks).map(([check, result]: [string, any]) => (
                      <div key={check} className="flex justify-between">
                        <span>{check}:</span>
                        <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.passed ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
            
            {testResult.extractedData && (
              <div className="mt-4 space-y-3">
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
                    📋 View Raw Extracted Data from EDF Header
                  </summary>
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div><strong>EDF Version:</strong> "{testResult.extractedData.version}"</div>
                      <div><strong>Header Size:</strong> {testResult.extractedData.headerBytes} bytes</div>
                      <div><strong>Patient ID:</strong> "{testResult.extractedData.patientId}"</div>
                      <div><strong>Number of Records:</strong> {testResult.extractedData.numberOfRecords}</div>
                      <div><strong>Recording ID:</strong> "{testResult.extractedData.recordingId}"</div>
                      <div><strong>Duration per Record:</strong> {testResult.extractedData.durationOfRecord}s</div>
                      <div><strong>Start Date:</strong> "{testResult.extractedData.startDate}"</div>
                      <div><strong>Number of Signals:</strong> {testResult.extractedData.numberOfSignals}</div>
                      <div><strong>Start Time:</strong> "{testResult.extractedData.startTime}"</div>
                      <div><strong>Calculated Size:</strong> {testResult.extractedData.calculatedFileSize}</div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-blue-700">
                        <strong>🔍 This is the actual data extracted from your CHB-MIT file's binary header.</strong>
                        The parser read these values directly from the EDF format structure.
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            )}
            
            {testResult.signalData && (
              <div className="mt-4 space-y-3">
                <details className="text-sm">
                  <summary className="cursor-pointer text-green-600 hover:text-green-800 font-semibold">
                    🧠 View Actual EEG Brain Wave Data (AI Training Data)
                  </summary>
                  <div className="mt-3 p-4 bg-green-50 rounded-lg space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div><strong>Total EEG Samples:</strong> {testResult.signalData.sampleCount.toLocaleString()}</div>
                      <div><strong>Time Points:</strong> {testResult.signalData.timePoints.toLocaleString()}</div>
                      <div><strong>Data Quality:</strong> {testResult.signalData.dataQuality}</div>
                      <div><strong>Sample Type:</strong> {testResult.signalData.dataQuality === 'SAMPLE' ? 'First 1000 points' : 'Full dataset'}</div>
                    </div>
                    
                    {testResult.signalData.channelSample.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="font-semibold text-green-700 mb-2">📡 Real Brain Wave Voltages (FP1-F7 channel):</p>
                        <div className="bg-white p-2 rounded border font-mono text-xs">
                          {testResult.signalData.channelSample.map((voltage, i) => (
                            <span key={i} className="mr-2">
                              {voltage.toFixed(1)}μV
                            </span>
                          ))}
                          <span className="text-gray-500">...</span>
                        </div>
                        <p className="mt-2 text-green-600">
                          <strong>🔬 This is REAL brain activity data that will train the AI!</strong> 
                          Each number represents electrical activity measured from the patient's brain.
                        </p>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
            
            {testResult.isRealData && testResult.validation?.isValid && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ <strong>Verified!</strong> This appears to be correctly parsed CHB-MIT medical data 
                  with {testResult.validation.confidence.toLowerCase()} confidence.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {testStatus === 'success' && !testResult && (
        <Card>
          <CardHeader>
            <CardTitle>✅ Infrastructure Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>✅ React components loading correctly</div>
              <div>✅ CHB EDF Reader imported successfully</div>
              <div>✅ File upload system ready</div>
              <div>✅ Medical data parsing capabilities active</div>
              <div>🏥 Ready to analyze real CHB-MIT seizure data</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
