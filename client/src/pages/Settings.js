import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import Spinner from '../components/layout/Spinner';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

// Simple, non-memoized button component
const ToggleButton = ({ isActive, onClick, label }) => (
  <div className="flex justify-between items-center mb-4">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <button
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
        isActive ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      onClick={onClick}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
          isActive ? 'translate-x-6' : 'translate-x-0'
        }`}
      ></div>
    </button>
  </div>
);

const Settings = () => {
  const { user, isLoading } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const [settings, setSettings] = useState({
    theme: darkMode ? 'dark' : 'light',
    notifications: true,
    fontSize: 'medium',
    language: 'english'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on component mount only
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('user-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to parse settings:', error);
    }
  }, []); // Empty dependency array - only run once on mount

  // Simple handler functions without memoization
  const handleChange = (setting, value) => {
    setSettings(prev => ({...prev, [setting]: value}));
    
    // If theme is changing, use the ThemeContext toggleTheme
    if (setting === 'theme') {
      toggleTheme();
    }
  };

  const saveSettings = () => {
    setIsSaving(true);
    // Short timeout for API simulation
    setTimeout(() => {
      try {
        localStorage.setItem('user-settings', JSON.stringify(settings));
        setIsSaving(false);
        toast.success('Settings saved successfully!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        toast.error('Failed to save settings');
        setIsSaving(false);
      }
    }, 300);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      theme: 'light',
      notifications: true,
      fontSize: 'medium',
      language: 'english'
    };
    setSettings(defaultSettings);
    try {
      localStorage.setItem('user-settings', JSON.stringify(defaultSettings));
      toast.info('Settings reset to defaults');
      
      // If we're in dark mode, toggle to light mode
      if (darkMode) {
        toggleTheme();
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen dark:bg-gray-800">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-700">
        <div className="px-6 py-4 bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
        </div>
        <div className="p-6">
          {/* Appearance Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Appearance</h3>
            <ToggleButton 
              isActive={darkMode} 
              onClick={() => handleChange('theme', darkMode ? 'light' : 'dark')}
              label="Dark Mode"
            />
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Font Size</span>
              <select
                className="ml-2 p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                value={settings.fontSize}
                onChange={(e) => handleChange('fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Notifications</h3>
            <ToggleButton 
              isActive={settings.notifications} 
              onClick={() => handleChange('notifications', !settings.notifications)}
              label="Email Notifications"
            />
          </div>

          {/* Language Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Language</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Preferred Language</span>
              <select
                className="ml-2 p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;