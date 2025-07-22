import React, { useState, useRef } from "react";
import { PerformanceMetrics, SystemHealth } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  Database
} from "lucide-react";

export default function LoadTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [testConfig, setTestConfig] = useState({
    concurrent_users: 1000,
    duration_minutes: 5,
    ramp_up_seconds: 30,
    test_scenarios: ['video_watch', 'user_registration', 'video_upload', 'search']
  });
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const testWorkers = useRef([]);

  const startLoadTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    const testResults = {
      start_time: new Date().toISOString(),
      concurrent_users: testConfig.concurrent_users,
      duration_minutes: testConfig.duration_minutes,
      scenarios: {},
      system_metrics: {},
      errors: []
    };

    try {
      // Simulate load testing by creating concurrent operations
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, (testConfig.duration_minutes * 60 * 1000) / 100);

      // Simulate different test scenarios
      await Promise.all(testConfig.test_scenarios.map(async (scenario) => {
        const scenarioResults = await runScenario(scenario, testConfig.concurrent_users);
        testResults.scenarios[scenario] = scenarioResults;
      }));

      // Monitor system metrics during test
      testResults.system_metrics = await collectSystemMetrics();
      
      testResults.end_time = new Date().toISOString();
      setResults(testResults);

      // Store results for analysis
      await PerformanceMetrics.create({
        metric_name: 'load_test_results',
        value: testConfig.concurrent_users,
        unit: 'concurrent_users',
        timestamp: new Date().toISOString(),
        session_id: `load_test_${Date.now()}`,
        additional_data: testResults
      });

    } catch (error) {
      console.error('Load test failed:', error);
      testResults.errors.push(error.message);
      setResults(testResults);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const runScenario = async (scenario, concurrentUsers) => {
    const results = {
      scenario_name: scenario,
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      avg_response_time: 0,
      max_response_time: 0,
      min_response_time: 0,
      requests_per_second: 0,
      errors: []
    };

    // Simulate different load patterns for each scenario
    const batchSize = Math.min(100, concurrentUsers);
    const batches = Math.ceil(concurrentUsers / batchSize);
    
    let responseTimes = [];
    
    for (let batch = 0; batch < batches; batch++) {
      const batchPromises = [];
      
      for (let i = 0; i < batchSize && (batch * batchSize + i) < concurrentUsers; i++) {
        batchPromises.push(simulateUserAction(scenario));
      }
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        results.total_requests++;
        if (result.status === 'fulfilled') {
          results.successful_requests++;
          responseTimes.push(result.value.responseTime);
        } else {
          results.failed_requests++;
          results.errors.push(result.reason?.message || 'Unknown error');
        }
      });
      
      // Add small delay between batches to simulate realistic load
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    if (responseTimes.length > 0) {
      results.avg_response_time = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
      results.max_response_time = Math.max(...responseTimes);
      results.min_response_time = Math.min(...responseTimes);
      results.requests_per_second = results.total_requests / (testConfig.duration_minutes * 60);
    }
    
    return results;
  };

  const simulateUserAction = async (scenario) => {
    const startTime = Date.now();
    
    // Simulate different scenarios with realistic delays and potential failures
    switch (scenario) {
      case 'video_watch':
        await simulateDelay(100, 500); // Video loading time
        if (Math.random() > 0.95) throw new Error('Video failed to load');
        break;
        
      case 'user_registration':
        await simulateDelay(200, 800); // Form submission time
        if (Math.random() > 0.98) throw new Error('Registration failed');
        break;
        
      case 'video_upload':
        await simulateDelay(1000, 3000); // Upload processing time
        if (Math.random() > 0.92) throw new Error('Upload failed');
        break;
        
      case 'search':
        await simulateDelay(50, 200); // Search query time
        if (Math.random() > 0.99) throw new Error('Search timeout');
        break;
        
      default:
        await simulateDelay(100, 300);
    }
    
    return { responseTime: Date.now() - startTime };
  };

  const simulateDelay = (min, max) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  };

  const collectSystemMetrics = async () => {
    // Simulate collecting system metrics during load test
    return {
      avg_cpu_usage: Math.random() * 60 + 20,
      avg_memory_usage: Math.random() * 50 + 30,
      peak_memory_usage: Math.random() * 80 + 40,
      database_connections: Math.floor(Math.random() * 500 + 100),
      cache_hit_rate: Math.random() * 30 + 70,
      error_rate: Math.random() * 2,
      throughput: Math.random() * 1000 + 500
    };
  };

  const stopLoadTest = () => {
    setIsRunning(false);
    testWorkers.current.forEach(worker => worker.terminate?.());
    testWorkers.current = [];
  };

  const getScenarioIcon = (scenario) => {
    switch (scenario) {
      case 'video_watch': return <Play className="w-4 h-4" />;
      case 'user_registration': return <Users className="w-4 h-4" />;
      case 'video_upload': return <Zap className="w-4 h-4" />;
      case 'search': return <BarChart3 className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Load Testing Dashboard</h3>
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <Button onClick={startLoadTest} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Start Load Test
            </Button>
          ) : (
            <Button onClick={stopLoadTest} variant="destructive">
              <Pause className="w-4 h-4 mr-2" />
              Stop Test
            </Button>
          )}
        </div>
      </div>

      {/* Test Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Concurrent Users</label>
          <Input
            type="number"
            value={testConfig.concurrent_users}
            onChange={(e) => setTestConfig(prev => ({ ...prev, concurrent_users: parseInt(e.target.value) }))}
            disabled={isRunning}
            min="1"
            max="10000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
          <Input
            type="number"
            value={testConfig.duration_minutes}
            onChange={(e) => setTestConfig(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
            disabled={isRunning}
            min="1"
            max="60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ramp-up (seconds)</label>
          <Input
            type="number"
            value={testConfig.ramp_up_seconds}
            onChange={(e) => setTestConfig(prev => ({ ...prev, ramp_up_seconds: parseInt(e.target.value) }))}
            disabled={isRunning}
            min="10"
            max="300"
          />
        </div>
        <div className="flex items-end">
          <div className={`w-full h-2 bg-gray-200 rounded-full ${isRunning ? 'animate-pulse' : ''}`}>
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Test Progress */}
      {isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-blue-900">Load Test in Progress...</span>
            <span className="text-blue-700">{progress}%</span>
          </div>
          <div className="text-sm text-blue-800">
            Simulating {testConfig.concurrent_users} concurrent users for {testConfig.duration_minutes} minutes
          </div>
        </div>
      )}

      {/* Test Results */}
      {results && (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">Test Results Summary</h4>
            
            {/* Overall Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(results.scenarios).reduce((sum, s) => sum + s.successful_requests, 0)}
                </div>
                <div className="text-sm text-gray-600">Successful Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(results.scenarios).reduce((sum, s) => sum + s.failed_requests, 0)}
                </div>
                <div className="text-sm text-gray-600">Failed Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(results.scenarios).reduce((sum, s) => sum + s.avg_response_time, 0) / Object.keys(results.scenarios).length || 0}ms
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(results.scenarios).reduce((sum, s) => sum + s.requests_per_second, 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Requests/sec</div>
              </div>
            </div>

            {/* Scenario Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.scenarios).map(([scenario, data]) => (
                <div key={scenario} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getScenarioIcon(scenario)}
                    <h5 className="font-semibold capitalize">{scenario.replace('_', ' ')}</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Success Rate: <span className="font-semibold">{((data.successful_requests / data.total_requests) * 100).toFixed(1)}%</span></div>
                    <div>Avg Time: <span className="font-semibold">{data.avg_response_time.toFixed(0)}ms</span></div>
                    <div>Requests: <span className="font-semibold">{data.total_requests}</span></div>
                    <div>RPS: <span className="font-semibold">{data.requests_per_second.toFixed(1)}</span></div>
                  </div>
                  {data.errors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                      <span className="text-red-800">Errors: {data.errors.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* System Metrics During Test */}
            {results.system_metrics && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-3">System Performance During Test</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">CPU Usage:</span>
                    <span className="font-semibold ml-1">{results.system_metrics.avg_cpu_usage?.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Memory:</span>
                    <span className="font-semibold ml-1">{results.system_metrics.avg_memory_usage?.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Cache Hit:</span>
                    <span className="font-semibold ml-1">{results.system_metrics.cache_hit_rate?.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">DB Connections:</span>
                    <span className="font-semibold ml-1">{results.system_metrics.database_connections}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}