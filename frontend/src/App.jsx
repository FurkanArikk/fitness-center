import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Classes from './pages/Classes';
import Trainers from './pages/Trainers';
import Equipment from './pages/Equipment';
import Payments from './pages/Payments';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="classes" element={<Classes />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="payments" element={<Payments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;