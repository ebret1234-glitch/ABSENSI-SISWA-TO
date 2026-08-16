import React, { useState, useEffect } from 'react';
import { AuthUser } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentAttendanceView } from './components/StudentAttendanceView';
import { CheckAttendanceView } from './components/CheckAttendanceView';
import { AdminLoginView } from './components/AdminLoginView';
import { WaliKelasLoginView } from './components/WaliKelasLoginView';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentManagementView } from './components/StudentManagementView';
import { TeacherManagementView } from './components/TeacherManagementView';
import { ClassManagementView } from './components/ClassManagementView';
import { AttendanceCorrectionView } from './components/AttendanceCorrectionView';
import { RecapWeeklyView } from './components/RecapWeeklyView';
import { RecapMonthlyView } from './components/RecapMonthlyView';
import { RecapYearlyView } from './components/RecapYearlyView';
import { ReportPrintView } from './components/ReportPrintView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('sisfo_auth_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('absen') || params.get('cek');
    if (viewParam === 'student-attendance' || viewParam === 'absen' || window.location.hash === '#absen') {
      return 'student-attendance';
    }
    if (viewParam === 'check-attendance' || viewParam === 'cek' || viewParam === 'check' || window.location.hash === '#cek') {
      return 'check-attendance';
    }
    const savedUser = localStorage.getItem('sisfo_auth_user');
    const savedView = localStorage.getItem('sisfo_current_view');
    if (savedUser) {
      return savedView || 'dashboard';
    }
    return savedView && savedView !== 'dashboard' ? savedView : 'landing';
  });

  const [activeDashboardTab, setActiveDashboardTab] = useState<string>(() => {
    return localStorage.getItem('sisfo_active_tab') || 'overview';
  });

  // Save session state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sisfo_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sisfo_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sisfo_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('sisfo_active_tab', activeDashboardTab);
  }, [activeDashboardTab]);

  // Keep URL in sync with currentView for easy sharing
  useEffect(() => {
    if (currentView === 'student-attendance') {
      window.history.replaceState(null, '', '?view=student-attendance');
    } else if (currentView === 'check-attendance') {
      window.history.replaceState(null, '', '?view=check-attendance');
    } else if (currentView === 'landing' && !currentUser) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [currentView, currentUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    setActiveDashboardTab('overview');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    localStorage.removeItem('sisfo_auth_user');
    localStorage.removeItem('sisfo_current_view');
    localStorage.removeItem('sisfo_active_tab');
  };

  const renderDashboardContent = () => {
    if (!currentUser) return null;

    switch (activeDashboardTab) {
      case 'overview':
        return <DashboardOverview currentUser={currentUser} />;
      case 'students':
        return <StudentManagementView currentUser={currentUser} />;
      case 'teachers':
        return <TeacherManagementView currentUser={currentUser} />;
      case 'classes':
        return <ClassManagementView currentUser={currentUser} />;
      case 'attendance':
        return <AttendanceCorrectionView currentUser={currentUser} />;
      case 'recap-weekly':
        return <RecapWeeklyView currentUser={currentUser} />;
      case 'recap-monthly':
        return <RecapMonthlyView currentUser={currentUser} />;
      case 'recap-yearly':
        return <RecapYearlyView currentUser={currentUser} />;
      case 'reports':
        return <ReportPrintView currentUser={currentUser} />;
      case 'backup-restore':
        return <BackupRestoreView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview currentUser={currentUser} />;
    }
  };

  // If user is logged in, show DashboardLayout
  if (currentView === 'dashboard' && currentUser) {
    return (
      <DashboardLayout
        currentUser={currentUser}
        activeTab={activeDashboardTab}
        setActiveTab={setActiveDashboardTab}
        onLogout={handleLogout}
      >
        {renderDashboardContent()}
      </DashboardLayout>
    );
  }

  // Public Views (Landing, Attendance, Login)
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {currentView === 'landing' && (
        <LandingPage onSelectAccess={(view) => setCurrentView(view)} />
      )}

      {currentView === 'student-attendance' && (
        <StudentAttendanceView 
          onBackToHome={() => setCurrentView('landing')} 
          onGoToCheckAttendance={() => setCurrentView('check-attendance')}
        />
      )}

      {currentView === 'check-attendance' && (
        <CheckAttendanceView 
          onBackToHome={() => setCurrentView('landing')}
          onGoToAttendance={() => setCurrentView('student-attendance')}
        />
      )}

      {currentView === 'admin-login' && (
        <AdminLoginView
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'wali-login' && (
        <WaliKelasLoginView
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setCurrentView('landing')}
        />
      )}

    </div>
  );
}
