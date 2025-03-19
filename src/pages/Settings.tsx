
import React, { useState, useEffect } from 'react';
import { Volume2, Sliders, Bell, Save } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import GameButton from '@/components/ui/GameButton';
import { 
  setSpeechRate, 
  getSpeechRate, 
  speak, 
  getVoices, 
  setVoice 
} from '@/utils/speechSynthesis';
import { 
  setVibrationEnabled, 
  isVibrationEnabled, 
  setVibrationIntensity, 
  getVibrationIntensity, 
  isVibrationSupported,
  triggerHaptics
} from '@/utils/haptics';
import { addCommandListener } from '@/utils/speechRecognition';

const Settings = () => {
  const [speechRate, setSpeechRateState] = useState(1);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  const [vibrationIntensity, setVibrationIntensityState] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number | null>(null);
  
  // Load settings on component mount
  useEffect(() => {
    // Load speech rate
    setSpeechRateState(getSpeechRate());
    
    // Load vibration settings
    setVibrationEnabledState(isVibrationEnabled());
    setVibrationIntensityState(getVibrationIntensity());
    
    // Load available voices
    const loadVoices = () => {
      const availableVoices = getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Try to load saved voice index
        const savedVoiceIndex = localStorage.getItem('selectedVoiceIndex');
        if (savedVoiceIndex !== null) {
          const index = parseInt(savedVoiceIndex);
          if (!isNaN(index) && index >= 0 && index < availableVoices.length) {
            setSelectedVoiceIndex(index);
          }
        }
      }
    };
    
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    
    // Handle settings commands
    const handleSettingsCommand = (command: string) => {
      if (command.includes('speed') || command.includes('rate')) {
        if (command.includes('slow')) {
          handleSpeechRateChange(0.7);
        } else if (command.includes('fast')) {
          handleSpeechRateChange(1.3);
        } else if (command.includes('normal')) {
          handleSpeechRateChange(1);
        }
      } else if (command.includes('vibration') || command.includes('haptic')) {
        if (command.includes('off') || command.includes('disable')) {
          handleVibrationEnabledChange(false);
        } else if (command.includes('on') || command.includes('enable')) {
          handleVibrationEnabledChange(true);
        } else if (command.includes('high') || command.includes('strong')) {
          handleVibrationIntensityChange(1.5);
        } else if (command.includes('low') || command.includes('gentle')) {
          handleVibrationIntensityChange(0.7);
        } else if (command.includes('medium') || command.includes('normal')) {
          handleVibrationIntensityChange(1);
        }
      } else if (command.includes('save')) {
        handleSaveSettings();
      }
    };
    
    // Add listener for settings commands
    const removeListener = addCommandListener('settings', handleSettingsCommand);
    
    return () => {
      removeListener();
    };
  }, []);
  
  // Handle speech rate change
  const handleSpeechRateChange = (rate: number) => {
    setSpeechRateState(rate);
    setSpeechRate(rate);
    speak(`Speech rate set to ${rate === 0.7 ? 'slow' : rate === 1.3 ? 'fast' : 'normal'}`);
  };
  
  // Handle vibration enabled change
  const handleVibrationEnabledChange = (enabled: boolean) => {
    setVibrationEnabledState(enabled);
    setVibrationEnabled(enabled);
    speak(`Vibration ${enabled ? 'enabled' : 'disabled'}`);
    
    if (enabled) {
      triggerHaptics();
    }
  };
  
  // Handle vibration intensity change
  const handleVibrationIntensityChange = (intensity: number) => {
    setVibrationIntensityState(intensity);
    setVibrationIntensity(intensity);
    speak(`Vibration intensity set to ${intensity === 0.7 ? 'low' : intensity === 1.5 ? 'high' : 'medium'}`);
    
    if (isVibrationEnabled()) {
      triggerHaptics(50 * intensity);
    }
  };
  
  // Handle voice change
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    setSelectedVoiceIndex(index);
    setVoice(index);
    
    // Speak with new voice
    if (voices[index]) {
      speak(`Voice set to ${voices[index].name}`);
    }
  };
  
  // Save all settings
  const handleSaveSettings = () => {
    // Settings are already saved in their respective handlers
    speak('Settings saved');
    triggerHaptics(70);
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        <div className="glass-panel p-6 rounded-xl w-full max-w-md lg:max-w-lg">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <Sliders className="mr-2 h-6 w-6 text-primary" />
            Accessibility Settings
          </h1>
          
          <div className="space-y-8">
            {/* Speech Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Volume2 className="mr-2 h-5 w-5 text-primary" />
                Voice Settings
              </h2>
              
              <div className="space-y-2">
                <label htmlFor="speech-rate" className="block text-sm font-medium">
                  Speech Rate: {speechRate === 0.7 ? 'Slow' : speechRate === 1.3 ? 'Fast' : 'Normal'}
                </label>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleSpeechRateChange(0.7)}
                    className={`px-3 py-2 rounded-md flex-1 focus-ring ${speechRate === 0.7 ? 'bg-primary text-white' : 'bg-secondary'}`}
                    aria-pressed={speechRate === 0.7}
                  >
                    Slow
                  </button>
                  <button 
                    onClick={() => handleSpeechRateChange(1)}
                    className={`px-3 py-2 rounded-md flex-1 focus-ring ${speechRate === 1 ? 'bg-primary text-white' : 'bg-secondary'}`}
                    aria-pressed={speechRate === 1}
                  >
                    Normal
                  </button>
                  <button 
                    onClick={() => handleSpeechRateChange(1.3)}
                    className={`px-3 py-2 rounded-md flex-1 focus-ring ${speechRate === 1.3 ? 'bg-primary text-white' : 'bg-secondary'}`}
                    aria-pressed={speechRate === 1.3}
                  >
                    Fast
                  </button>
                </div>
              </div>
              
              {voices.length > 0 && (
                <div className="space-y-2">
                  <label htmlFor="voice-select" className="block text-sm font-medium">
                    Voice
                  </label>
                  <select
                    id="voice-select"
                    className="w-full px-3 py-2 bg-secondary border border-input rounded-md focus-ring"
                    value={selectedVoiceIndex !== null ? selectedVoiceIndex : ''}
                    onChange={handleVoiceChange}
                  >
                    <option value="" disabled>Select a voice</option>
                    {voices.map((voice, index) => (
                      <option key={`${voice.name}-${index}`} value={index}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Haptic Feedback Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Haptic Feedback
              </h2>
              
              {isVibrationSupported() ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="vibration-toggle" className="block text-sm font-medium">
                        Vibration Feedback
                      </label>
                      <button
                        id="vibration-toggle"
                        onClick={() => handleVibrationEnabledChange(!vibrationEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full focus-ring ${vibrationEnabled ? 'bg-primary' : 'bg-secondary'}`}
                        aria-checked={vibrationEnabled}
                        role="switch"
                      >
                        <span className="sr-only">
                          {vibrationEnabled ? 'Disable vibration' : 'Enable vibration'}
                        </span>
                        <span 
                          className={`${vibrationEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  {vibrationEnabled && (
                    <div className="space-y-2">
                      <label htmlFor="vibration-intensity" className="block text-sm font-medium">
                        Vibration Intensity: {vibrationIntensity === 0.7 ? 'Low' : vibrationIntensity === 1.5 ? 'High' : 'Medium'}
                      </label>
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => handleVibrationIntensityChange(0.7)}
                          className={`px-3 py-2 rounded-md flex-1 focus-ring ${vibrationIntensity === 0.7 ? 'bg-primary text-white' : 'bg-secondary'}`}
                          aria-pressed={vibrationIntensity === 0.7}
                        >
                          Low
                        </button>
                        <button 
                          onClick={() => handleVibrationIntensityChange(1)}
                          className={`px-3 py-2 rounded-md flex-1 focus-ring ${vibrationIntensity === 1 ? 'bg-primary text-white' : 'bg-secondary'}`}
                          aria-pressed={vibrationIntensity === 1}
                        >
                          Medium
                        </button>
                        <button 
                          onClick={() => handleVibrationIntensityChange(1.5)}
                          className={`px-3 py-2 rounded-md flex-1 focus-ring ${vibrationIntensity === 1.5 ? 'bg-primary text-white' : 'bg-secondary'}`}
                          aria-pressed={vibrationIntensity === 1.5}
                        >
                          High
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Vibration is not supported on this device.
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <GameButton 
              onClick={handleSaveSettings}
              speakText="Settings saved"
              className="w-full"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Settings
            </GameButton>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-xl w-full max-w-md lg:max-w-lg">
          <h2 className="text-xl font-bold mb-4">Voice Commands</h2>
          <ul className="list-disc list-inside text-left space-y-2">
            <li>Say "<strong>speed slow</strong>" or "<strong>speed fast</strong>" to change speech rate</li>
            <li>Say "<strong>vibration on</strong>" or "<strong>vibration off</strong>" to toggle haptic feedback</li>
            <li>Say "<strong>vibration high</strong>" or "<strong>vibration low</strong>" to adjust intensity</li>
            <li>Say "<strong>save</strong>" to save your settings</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
