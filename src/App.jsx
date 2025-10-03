import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Camera, Activity, Zap, Download, Volume2, VolumeX, BarChart3, Target, Radio, Eye, Lock } from 'lucide-react';

const SkyGuardAI = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [detections, setDetections] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [drones, setDrones] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [totalScanned, setTotalScanned] = useState(0);
  const [activeThreats, setActiveThreats] = useState(0);
  const [systemUptime, setSystemUptime] = useState(0);
  const [radarSweep, setRadarSweep] = useState(0);
  const [neutralized, setNeutralized] = useState(0);
  const [selectedDrone, setSelectedDrone] = useState(null);

  const playSound = (type) => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'detection') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'alert') {
      oscillator.frequency.value = 1200;
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 900;
        setTimeout(() => oscillator.stop(), 100);
      }, 100);
    } else if (type === 'startup') {
      [600, 800, 1000].forEach((freq, i) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          osc.start();
          osc.stop(audioContext.currentTime + 0.15);
        }, i * 100);
      });
    }
  };

  useEffect(() => {
    if (isMonitoring) {
      const timer = setInterval(() => {
        setSystemUptime(prev => prev + 1);
      }, 1000);
      
      const radarTimer = setInterval(() => {
        setRadarSweep(prev => (prev + 1) % 360);
      }, 50);
      
      return () => {
        clearInterval(timer);
        clearInterval(radarTimer);
      };
    }
  }, [isMonitoring]);

  const formatUptime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setDetections([]);
    setDrones([]);
    setShowAlert(false);
    setTotalScanned(0);
    setActiveThreats(0);
    setSystemUptime(0);
    setNeutralized(0);
    setSelectedDrone(null);
    
    playSound('startup');
    
    const scanCounter = setInterval(() => {
      setTotalScanned(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 500);
    
    const interval = setInterval(() => {
      const detectionChance = Math.random();
      
      if (detectionChance > 0.65) {
        const threats = ['Low', 'Medium', 'High'];
        const models = ['DJI Phantom 4', 'Mavic Pro 2', 'Unknown Model', 'Custom Build', 'Parrot Anafi', 'Autel Evo'];
        const threat = threats[Math.floor(Math.random() * threats.length)];
        
        const newDetection = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          threat: threat,
          model: models[Math.floor(Math.random() * models.length)],
          distance: Math.floor(Math.random() * 500) + 100,
          confidence: Math.floor(Math.random() * 15) + 85,
          speed: Math.floor(Math.random() * 30) + 10,
          altitude: Math.floor(Math.random() * 200) + 50,
          direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]
        };
        
        setDetections(prev => [newDetection, ...prev].slice(0, 10));
        setActiveThreats(prev => prev + 1);
        
        playSound('detection');
        
        if (threat === 'High' || threat === 'Medium') {
          setShowAlert(true);
          playSound('alert');
          setTimeout(() => setShowAlert(false), 3000);
        }
        
        const newDrone = {
          id: newDetection.id,
          x: Math.random() * 60 + 20,
          y: Math.random() * 60 + 20,
          threat: threat,
          ...newDetection
        };
        setDrones(prev => [...prev, newDrone]);
        
        setTimeout(() => {
          setDrones(prev => prev.filter(d => d.id !== newDetection.id));
          setActiveThreats(prev => Math.max(0, prev - 1));
          setNeutralized(prev => prev + 1);
          if (selectedDrone?.id === newDetection.id) {
            setSelectedDrone(null);
          }
        }, 5000);
      }
    }, 2500);
    
    return () => {
      clearInterval(interval);
      clearInterval(scanCounter);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setDrones([]);
    setShowAlert(false);
    setSelectedDrone(null);
  };

  const triggerHighThreat = () => {
    if (!isMonitoring) return;
    
    const highThreatDetection = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      threat: 'High',
      model: 'Military Grade UAV',
      distance: 150,
      confidence: 98,
      speed: 45,
      altitude: 120,
      direction: 'N'
    };
    
    setDetections(prev => [highThreatDetection, ...prev].slice(0, 10));
    setActiveThreats(prev => prev + 1);
    setShowAlert(true);
    playSound('alert');
    
    const newDrone = {
      id: highThreatDetection.id,
      x: 50,
      y: 50,
      threat: 'High',
      ...highThreatDetection
    };
    setDrones(prev => [...prev, newDrone]);
    
    setTimeout(() => {
      setShowAlert(false);
      setDrones(prev => prev.filter(d => d.id !== highThreatDetection.id));
      setActiveThreats(prev => Math.max(0, prev - 1));
      setNeutralized(prev => prev + 1);
      if (selectedDrone?.id === highThreatDetection.id) {
        setSelectedDrone(null);
      }
    }, 5000);
  };

  const exportReport = () => {
    const report = `╔════════════════════════════════════════════════════════╗
║         SkyGuard AI - Detection Report                 ║
╚════════════════════════════════════════════════════════╝

Generated: ${new Date().toLocaleString()}
System Uptime: ${formatUptime(systemUptime)}
Status: ${isMonitoring ? 'ACTIVE MONITORING' : 'STANDBY'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Objects Scanned: ${totalScanned}
Active Threats: ${activeThreats}
Neutralized Threats: ${neutralized}
Total Detections: ${detections.length}
High Threats: ${detections.filter(d => d.threat === 'High').length}
Medium Threats: ${detections.filter(d => d.threat === 'Medium').length}
Low Threats: ${detections.filter(d => d.threat === 'Low').length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETAILED DETECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${detections.map((d, i) => `
[${i + 1}] Detection at ${d.time}
    Model: ${d.model}
    Threat Level: ${d.threat}
    Distance: ${d.distance}m
    Direction: ${d.direction}
    Speed: ${d.speed} km/h
    Altitude: ${d.altitude}m
    Confidence: ${d.confidence}%
    ───────────────────────────────────────────────
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audio Alerts: ${soundEnabled ? 'ENABLED' : 'DISABLED'}
Detection Range: 500m
Update Frequency: Real-time
AI Confidence Threshold: 85%

Report generated by SkyGuard AI v2.0
https://skyguard.ai | support@skyguard.ai
`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyGuard-Report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    high: detections.filter(d => d.threat === 'High').length,
    medium: detections.filter(d => d.threat === 'Medium').length,
    low: detections.filter(d => d.threat === 'Low').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {showAlert && (
          <div className="mb-4 bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 rounded-xl p-4 animate-pulse shadow-2xl shadow-red-500/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="w-10 h-10 text-white animate-bounce" />
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-50 animate-ping"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">⚠️ CRITICAL THREAT DETECTED</h3>
                <p className="text-red-100">Unauthorized drone activity - Security protocols engaged</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden border-2 border-cyan-500/50 backdrop-blur">
              
              <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Shield className="w-10 h-10 text-white" />
                      {isMonitoring && (
                        <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-50 animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white tracking-wide">SkyGuard AI</h1>
                      <p className="text-cyan-100 text-sm">Autonomous Threat Detection System</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                      isMonitoring 
                        ? 'bg-emerald-500 text-white animate-pulse shadow-emerald-500/50' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-white animate-ping' : 'bg-slate-500'}`}></div>
                        {isMonitoring ? `LIVE ${formatUptime(systemUptime)}` : 'STANDBY'}
                      </div>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-2.5 bg-cyan-700/50 hover:bg-cyan-600 rounded-lg text-white transition-all hover:scale-110 backdrop-blur"
                      title={soundEnabled ? "Mute" : "Unmute"}
                    >
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setShowStats(!showStats)}
                      className="p-2.5 bg-cyan-700/50 hover:bg-cyan-600 rounded-lg text-white transition-all hover:scale-110 backdrop-blur"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 aspect-video overflow-hidden">
                
                {isMonitoring && (
                  <>
                    {/* Animated grid */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full">
                        {[...Array(20)].map((_, i) => (
                          <line
                            key={`v-${i}`}
                            x1={`${i * 5}%`}
                            y1="0"
                            x2={`${i * 5}%`}
                            y2="100%"
                            stroke="#06b6d4"
                            strokeWidth="1"
                            className="animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                        {[...Array(12)].map((_, i) => (
                          <line
                            key={`h-${i}`}
                            x1="0"
                            y1={`${i * 8.33}%`}
                            x2="100%"
                            y2={`${i * 8.33}%`}
                            stroke="#06b6d4"
                            strokeWidth="1"
                            className="animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </svg>
                    </div>

                    {/* Radar sweep effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-64 h-64">
                        <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"></div>
                        <div className="absolute inset-4 border-2 border-cyan-500/20 rounded-full"></div>
                        <div className="absolute inset-8 border-2 border-cyan-500/10 rounded-full"></div>
                        <div 
                          className="absolute inset-0 origin-center"
                          style={{ transform: `rotate(${radarSweep}deg)` }}
                        >
                          <div className="w-1 h-32 bg-gradient-to-t from-cyan-400 to-transparent mx-auto"></div>
                        </div>
                      </div>
                    </div>

                    {/* Corner brackets */}
                    <div className="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>

                    {/* Status badges */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-cyan-500/50 shadow-lg">
                        <div className="text-cyan-400 text-xs font-mono flex items-center gap-2">
                          <Radio className="w-4 h-4 animate-pulse" />
                          <span>SCANNING: {totalScanned} objects</span>
                        </div>
                      </div>
                      <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-emerald-500/50 shadow-lg">
                        <div className="text-emerald-400 text-xs font-mono flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span>NEUTRALIZED: {neutralized}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-cyan-500/50 shadow-lg">
                      <div className="text-cyan-400 text-xs font-mono">
                        {new Date().toLocaleString()}
                      </div>
                    </div>

                    {/* Drone markers */}
                    {drones.map(drone => (
                      <div
                        key={drone.id}
                        className="absolute transition-all duration-1000 ease-in-out cursor-pointer group"
                        style={{
                          left: `${drone.x}%`,
                          top: `${drone.y}%`,
                          animation: 'float 3s ease-in-out infinite'
                        }}
                        onClick={() => setSelectedDrone(drone)}
                      >
                        <div className={`relative w-28 h-28 ${
                          selectedDrone?.id === drone.id ? 'scale-125' : ''
                        } transition-transform`}>
                          {/* Pulse rings */}
                          <div className={`absolute inset-0 border-2 rounded-full animate-ping ${
                            drone.threat === 'High' ? 'border-red-500' :
                            drone.threat === 'Medium' ? 'border-yellow-500' :
                            'border-emerald-500'
                          }`}></div>
                          
                          {/* Target box */}
                          <div className={`absolute inset-0 border-2 rounded ${
                            drone.threat === 'High' ? 'border-red-500 shadow-lg shadow-red-500/50' :
                            drone.threat === 'Medium' ? 'border-yellow-500 shadow-lg shadow-yellow-500/50' :
                            'border-emerald-500 shadow-lg shadow-emerald-500/50'
                          }`}>
                            {/* Corner markers */}
                            <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 ${
                              drone.threat === 'High' ? 'border-red-500' :
                              drone.threat === 'Medium' ? 'border-yellow-500' :
                              'border-emerald-500'
                            }`}></div>
                            <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 ${
                              drone.threat === 'High' ? 'border-red-500' :
                              drone.threat === 'Medium' ? 'border-yellow-500' :
                              'border-emerald-500'
                            }`}></div>
                            <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 ${
                              drone.threat === 'High' ? 'border-red-500' :
                              drone.threat === 'Medium' ? 'border-yellow-500' :
                              'border-emerald-500'
                            }`}></div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 ${
                              drone.threat === 'High' ? 'border-red-500' :
                              drone.threat === 'Medium' ? 'border-yellow-500' :
                              'border-emerald-500'
                            }`}></div>
                            
                            {/* Center dot */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <div className={`w-3 h-3 rounded-full ${
                                drone.threat === 'High' ? 'bg-red-500' :
                                drone.threat === 'Medium' ? 'bg-yellow-500' :
                                'bg-emerald-500'
                              } animate-ping`}></div>
                              <div className={`absolute inset-0 w-3 h-3 rounded-full ${
                                drone.threat === 'High' ? 'bg-red-500' :
                                drone.threat === 'Medium' ? 'bg-yellow-500' :
                                'bg-emerald-500'
                              }`}></div>
                            </div>
                          </div>
                          
                          {/* Label */}
                          <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap px-2 py-1 rounded ${
                            drone.threat === 'High' ? 'bg-red-500 text-white' :
                            drone.threat === 'Medium' ? 'bg-yellow-500 text-black' :
                            'bg-emerald-500 text-white'
                          } shadow-lg`}>
                            {drone.threat}
                          </div>

                          {/* Hover info */}
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 backdrop-blur px-3 py-2 rounded-lg border border-cyan-500/50 text-xs text-white whitespace-nowrap pointer-events-none z-10">
                            <div>{drone.model}</div>
                            <div className="text-cyan-400">{drone.distance}m • {drone.speed}km/h</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {!isMonitoring && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <Eye className="w-24 h-24 text-slate-700 mx-auto mb-4" />
                        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20"></div>
                      </div>
                      <p className="text-slate-400 text-xl font-semibold">System Ready</p>
                      <p className="text-slate-600 text-sm mt-2">Initialize monitoring to begin detection</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Control panel */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex flex-wrap gap-3 justify-center border-t-2 border-cyan-500/30">
                <button
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 flex items-center gap-2 shadow-xl ${
                    isMonitoring 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/50' 
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/50'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                </button>
                
                {isMonitoring && (
                  <button
                    onClick={triggerHighThreat}
                    className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white transition-all transform hover:scale-105 flex items-center gap-2 shadow-xl shadow-orange-500/50"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Simulate Threat
                  </button>
                )}
                
                <button
                  onClick={exportReport}
                  disabled={detections.length === 0}
                  className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-cyan-500/50"
                >
                  <Download className="w-5 h-5" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Statistics cards */}
            {showStats && isMonitoring && (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-red-900/40 to-red-950/60 backdrop-blur border-2 border-red-500/50 rounded-xl p-4 text-center shadow-xl shadow-red-500/20 hover:scale-105 transition-transform">
                  <div className="text-4xl font-bold text-red-400 mb-1">{stats.high}</div>
                  <div className="text-red-300 text-sm font-semibold">High Threats</div>
                  <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mt-2 opacity-50" />
                </div>
                <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-950/60 backdrop-blur border-2 border-yellow-500/50 rounded-xl p-4 text-center shadow-xl shadow-yellow-500/20 hover:scale-105 transition-transform">
                  <div className="text-4xl font-bold text-yellow-400 mb-1">{stats.medium}</div>
                  <div className="text-yellow-300 text-sm font-semibold">Medium Threats</div>
                  <Activity className="w-5 h-5 text-yellow-400 mx-auto mt-2 opacity-50" />
                </div>
                <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 backdrop-blur border-2 border-emerald-500/50 rounded-xl p-4 text-center shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform">
                  <div className="text-4xl font-bold text-emerald-400 mb-1">{stats.low}</div>
                  <div className="text-emerald-300 text-sm font-semibold">Low Threats</div>
                  <Shield className="w-5 h-5 text-emerald-400 mx-auto mt-2 opacity-50" />
                </div>
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur border-2 border-blue-500/50 rounded-xl p-4 text-center shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform">
                  <div className="text-4xl font-bold text-blue-400 mb-1">{activeThreats}</div>
                  <div className="text-blue-300 text-sm font-semibold">Active Now</div>
                  <Target className="w-5 h-5 text-blue-400 mx-auto mt-2 opacity-50" />
                </div>
              </div>
            )}
          </div>

          {/* Detection log */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl border-2 border-cyan-500/50 h-full flex flex-col backdrop-blur">
              <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Detection Log
                </h2>
                <p className="text-cyan-100 text-sm mt-1">
                  {detections.length} detection{detections.length !== 1 ? 's' : ''} logged
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px] custom-scrollbar">
                {detections.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <Shield className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                      <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-10"></div>
                    </div>
                    <p className="text-slate-400 font-semibold">No Detections</p>
                    <p className="text-slate-600 text-sm mt-2">Awaiting surveillance data...</p>
                  </div>
                ) : (
                  detections.map((detection) => (
                    <div
                      key={detection.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                        detection.threat === 'High'
                          ? 'bg-gradient-to-br from-red-900/40 to-red-950/60 border-red-500/70 hover:border-red-400 shadow-lg shadow-red-500/20'
                          : detection.threat === 'Medium'
                          ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-950/60 border-yellow-500/70 hover:border-yellow-400 shadow-lg shadow-yellow-500/20'
                          : 'bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 border-emerald-500/70 hover:border-emerald-400 shadow-lg shadow-emerald-500/20'
                      } animate-fadeIn backdrop-blur`}
                      onClick={() => {
                        const drone = drones.find(d => d.id === detection.id);
                        if (drone) setSelectedDrone(drone);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          detection.threat === 'High'
                            ? 'bg-red-600 text-white'
                            : detection.threat === 'Medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {detection.threat} THREAT
                        </span>
                        <span className="text-slate-400 text-xs font-mono">{detection.time}</span>
                      </div>
                      
                      <div className="text-white font-bold text-sm mb-3">{detection.model}</div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Distance:</span>
                          <span className="text-white font-semibold">{detection.distance}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Direction:</span>
                          <span className="text-white font-semibold">{detection.direction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Speed:</span>
                          <span className="text-white font-semibold">{detection.speed} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Altitude:</span>
                          <span className="text-white font-semibold">{detection.altitude}m</span>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Confidence:</span>
                            <span className="text-white font-semibold">{detection.confidence}%</span>
                          </div>
                          <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                detection.confidence >= 95 ? 'bg-emerald-500' : 
                                detection.confidence >= 90 ? 'bg-cyan-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${detection.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected drone details */}
        {selectedDrone && (
          <div className="mt-4 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/50 rounded-xl p-6 shadow-2xl backdrop-blur animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-cyan-400" />
                Target Details
              </h3>
              <button
                onClick={() => setSelectedDrone(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Model</div>
                <div className="text-white font-bold">{selectedDrone.model}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Distance</div>
                <div className="text-cyan-400 font-bold">{selectedDrone.distance}m</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Speed</div>
                <div className="text-cyan-400 font-bold">{selectedDrone.speed} km/h</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Altitude</div>
                <div className="text-cyan-400 font-bold">{selectedDrone.altitude}m</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Direction</div>
                <div className="text-white font-bold">{selectedDrone.direction}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Confidence</div>
                <div className="text-emerald-400 font-bold">{selectedDrone.confidence}%</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Threat Level</div>
                <div className={`font-bold ${
                  selectedDrone.threat === 'High' ? 'text-red-400' :
                  selectedDrone.threat === 'Medium' ? 'text-yellow-400' :
                  'text-emerald-400'
                }`}>{selectedDrone.threat}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <div className="text-slate-400 text-xs mb-1">Detected At</div>
                <div className="text-white font-bold text-xs">{selectedDrone.time}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/50 rounded-xl px-8 py-4 shadow-2xl backdrop-blur">
            <p className="text-cyan-400 font-bold text-lg mb-1">🛡️ SkyGuard AI v2.0</p>
            <p className="text-slate-400 text-sm">Advanced AI-Powered Drone Detection & Threat Assessment System</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
              <span>Real-time Processing</span>
              <span>•</span>
              <span>Multi-Threat Classification</span>
              <span>•</span>
              <span>Autonomous Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-8px) translateX(4px); }
          50% { transform: translateY(-4px) translateX(-4px); }
          75% { transform: translateY(-10px) translateX(2px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
};

export default SkyGuardAI;