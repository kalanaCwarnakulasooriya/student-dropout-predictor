import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { PredictPage } from './pages/PredictPage';
import { ResultPage } from './pages/ResultPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans" style={{background:'#080c18'}}>

        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />


        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />


        <div className="flex-1 md:pl-64">
          <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
