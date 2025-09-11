import React, { useState } from 'react';

const APITest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/health');
      const data = await response.json();
      setResult(`✅ Backend is working: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`❌ Backend error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testSalons = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/salons');
      const data = await response.json();
      setResult(`✅ Salons API working: Found ${data.salons?.length || 0} salons`);
      if (data.salons && data.salons.length > 0) {
        const firstSalon = data.salons[0];
        setResult(prev => prev + `\nFirst salon: ${firstSalon.nome} with ${firstSalon.images?.length || 0} images`);
      }
    } catch (error) {
      setResult(`❌ Salons API error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testAPI}
          disabled={loading}
          className="btn-primary mr-4"
        >
          Test Backend Health
        </button>
        
        <button
          onClick={testSalons}
          disabled={loading}
          className="btn-primary"
        >
          Test Salons API
        </button>
      </div>

      {loading && <div className="text-blue-600">Testing...</div>}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">Expected URLs:</h3>
        <ul className="text-sm space-y-1">
          <li>• <a href="/test-images" className="text-blue-600 hover:underline">/test-images</a> - Image test page</li>
          <li>• <a href="/search" className="text-blue-600 hover:underline">/search</a> - Search results with images</li>
          <li>• <a href="/salon/1" className="text-blue-600 hover:underline">/salon/1</a> - Salon details with gallery</li>
          <li>• <a href="/manager" className="text-blue-600 hover:underline">/manager</a> - Manager dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default APITest;
