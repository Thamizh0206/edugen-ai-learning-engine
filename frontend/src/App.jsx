import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { LoadingSection } from './components/LoadingSection';
import { SummarySection } from './components/SummarySection';
import { QuizSection } from './components/QuizSection';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const App = () => {
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, ready, error
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [docHash, setDocHash] = useState(null);
  const [loadingText, setLoadingText] = useState('Checking notes...');

  const handleUpload = async (file) => {
    setStatus('uploading');
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'ready') {
        setData(response.data.data);
        setStatus('ready');
      } else if (response.data.status === 'processing') {
        setDocHash(response.data.doc_hash);
        setStatus('processing');
        startPolling(response.data.doc_hash);
      } else if (response.data.error) {
        throw new Error(response.data.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || err.message || "Upload failed. Please try again.");
      setStatus('error');
    }
  };

  const startPolling = (hash) => {
    const MAX_WAIT_MS = 120000;
    const startTime = Date.now();
    setLoadingText("Analyzing your notes...");

    const pollInterval = setInterval(async () => {
      if (Date.now() - startTime > MAX_WAIT_MS) {
        clearInterval(pollInterval);
        setError("Processing timed out. Please try again.");
        setStatus('error');
        return;
      }

      try {
        const response = await axios.get(`/status/${hash}`);
        const data = response.data;

        if (data.status === 'error') {
          clearInterval(pollInterval);
          setError(data.error || "Processing failed.");
          setStatus('error');
          return;
        }

        if (data.status === 'ready') {
          clearInterval(pollInterval);
          if (data.data && data.data.error) {
            setError(data.data.error);
            setStatus('error');
            return;
          }
          setData(data.data);
          setStatus('ready');
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Silently continue polling unless persistent failure
      }
    }, 2000);
  };

  const reset = () => {
    setStatus('idle');
    setData(null);
    setDocHash(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-24 px-6 md:px-12">
      <Header />

      <main className="container mx-auto">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <UploadSection key="upload" onUpload={handleUpload} />
          )}

          {(status === 'uploading' || status === 'processing') && (
            <LoadingSection key="loading" text={loadingText} />
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto p-12 glass rounded-3xl text-center border-danger/40"
            >
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-danger" />
              </div>
              <h3 className="text-2xl font-bold text-red-100 mb-4">Something went wrong</h3>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">{error}</p>
              <button
                onClick={reset}
                className="btn secondary-btn px-8 py-3 flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          )}

          {status === 'ready' && data && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-4">
                <SummarySection summary={data.summary} />
                <button
                  onClick={reset}
                  className="btn secondary-btn w-full mt-6 py-4 flex items-center justify-center gap-2 bg-indigo-500/5 hover:bg-indigo-500/10"
                >
                  <RotateCcw className="w-4 h-4" /> Start New Lesson
                </button>
              </div>
              <div className="lg:col-span-8">
                <QuizSection
                  questions={data.questions}
                  topic={docHash}
                  user_id="anonymous"
                  onHome={reset}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
