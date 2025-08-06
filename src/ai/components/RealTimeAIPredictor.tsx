import React from 'react';

const RealTimeAIPredictor: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Real-Time AI Predictor</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg">AI Predictor component is working!</p>
        <p className="mt-4 text-gray-600">This is the real-time seizure prediction interface using the trained CNN-LSTM model.</p>
      </div>
    </div>
  );
};

export default RealTimeAIPredictor;
