import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Activity, Upload, ShieldAlert, Zap, Info, Heart, ChevronDown } from 'lucide-react';
import { HeartView, SignalView } from './EcgCanvas';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Connects to your Python Backend (main.py)
      const res = await axios.post('http://localhost:8000/analyze-ecg', formData);

      // Backend can return status: "success" | "error" even with a 200 response,
      // so we must check this before trusting the payload shape.
      if (res.data.status !== 'success' || !res.data.medical_report) {
        setError(res.data.message || 'The AI engine could not process this image.');
        return;
      }

      setData(res.data);

      // Smooth scroll to results after a short delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (err) {
      console.error('Diagnostic Error:', err);
      setError("Backend Connection Failed! Make sure 'python main.py' is running in the terminal.");
    } finally {
      setLoading(false);
      // Reset the input so re-uploading the same file re-triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const report = data?.medical_report;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="min-h-screen p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Cyber Grid */}
        <div className="absolute inset-0 ecg-grid opacity-30 pointer-events-none" />

        {/* Header Navigation */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse">
              <Activity className="text-red-500" size={20} />
            </div>
            <div>
              <span className="font-mono text-xs text-zinc-500 tracking-[0.2em] uppercase block leading-none mb-1">Project</span>
              <span className="font-black tracking-tighter text-xl italic text-white">CORVIS</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-mono text-zinc-500 tracking-wider uppercase">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> AI Core v4.0</span>
          </div>
        </div>

        {/* Core Dropzone Interface Container */}
        <div className="max-w-2xl w-full mx-auto text-center my-auto z-10">
          <p className="text-xs font-mono tracking-[0.4em] uppercase text-red-500 mb-4 animate-pulse-slow">
            Neural Diagnostic Interface
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
            Digitize Paper <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 to-rose-600">
              ECG Records
            </span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
            Upload high-resolution clinical ECG paper logs or charts to perform real-time extraction, metric interpolation, and structural anomaly assessment.
          </p>

          {/* Drag & Drop File Component Box */}
          <label className="group block relative cursor-pointer">
            <div className="absolute -inset-1 bg-linear-to-r from-red-500/20 to-rose-500/20 rounded-4xl blur opacity-40 group-hover:opacity-70 transition duration-500" />
            <div className="relative glass-panel rounded-4xl p-12 border border-white/5 transition-all group-hover:border-red-500/20 group-hover:bg-zinc-900/40">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={loading}
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/2 border border-white/5 text-zinc-400 group-hover:text-red-500 group-hover:bg-red-500/5 transition-all duration-300">
                  <Upload size={28} className={loading ? "animate-bounce" : ""} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide">
                    {loading ? "Processing Computer Vision Engine..." : "Drop ECG image file here or click"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">Accepts PNG, JPG, JPEG datasets</p>
                </div>
              </div>
            </div>
          </label>

          {/* Inline error banner instead of a blocking alert() */}
          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-left">
              <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Scroll Indicator Footer Area */}
        <div className="flex flex-col items-center gap-2 text-zinc-600 animate-bounce cursor-pointer z-10">
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase">Metrics telemetry</span>
          <ChevronDown size={14} />
        </div>
      </section>

      {/* --- TELEMETRY / RESULTS SECTION --- */}
      {report && (
        <section ref={resultsRef} className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT SIDE: 3D Visualization Canvas Components */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <HeartView
                bpm={typeof report.heart_rate_bpm === 'number' ? report.heart_rate_bpm : undefined}
                severity={report.anomaly_score === 'High' || report.status === 'Critical' ? 0.9 : 0.15}
              />
              <SignalView points={data.points} />
            </div>

            {/* RIGHT SIDE: Extracted Metrics Reports Panels */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-8">
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Report Status</p>
                  <h2 className="text-lg font-bold tracking-tight uppercase">Analysis Matrix Complete</h2>
                </div>
              </div>

              {/* Numerical Metrics Cards Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                <MetricBox 
                  label="Heart Rate Average" 
                  value={`${report.heart_rate_bpm ?? '--'} BPM`}
                  icon={<Heart className="text-red-500" size={14} />} 
                />
                <MetricBox 
                  label="Signal Intervals" 
                  value={`${report.intervals_detected ?? 0} Segments`}
                  icon={<Activity className="text-indigo-400" size={14} />} 
                />
              </div>

              {/* Detailed Findings Analysis Text Box */}
              <div className="p-6 rounded-4xl bg-white/2 border border-white/5 flex flex-col gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Diagnostic Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {(report.diagnoses ?? []).length > 0 ? (
                      report.diagnoses.map((diag, idx) => (
                        <span key={idx} className="text-xs px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-medium">
                          {diag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 rounded-lg font-medium">
                        No flags returned
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex gap-4">
                  <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">Anomaly Engine Summary</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Image vectorization extracted structural details down to skeletal single-pixel representations, mapped and smoothed using Cubic Spline Interpolation. 
                      Anomaly Score: <span className="text-white font-bold">{report.anomaly_score ?? 'Unknown'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Medical Disclaimer Disclaimer Box */}
              <div className="flex gap-3 p-4 bg-white/5 rounded-2xl">
                <Info size={16} className="text-zinc-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-600 leading-relaxed uppercase tracking-wider">
                  Caution: CORVIS AI results are for research only. Not a replacement for a professional clinical diagnosis by a cardiologist.
                </p>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* --- FOOTER REGION --- */}
      <footer className="p-12 text-center text-zinc-800 border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Corvis Medical Systems © 2026</p>
      </footer>
    </div>
  );
}

function MetricBox({ label, value, icon }) {
  return (
    <div className="p-5 rounded-4xl bg-white/3 border border-white/5 hover:bg-white/6 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      </div>
      <p className="text-2xl font-bold font-mono tracking-tighter text-white">{value}</p>
    </div>
  );
}

export default App;