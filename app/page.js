"use client";
import { auth } from '../firebase';
import { useState , useEffect} from 'react';
import { IconFidgetSpinner } from "@tabler/icons-react";
import Link from "next/link";
import { useAuthState, useSignOut, useSendEmailVerification } from "react-firebase-hooks/auth";
import { SignedIn } from "./components/signed-in.js";
import { SignedOut } from "./components/signed-out.js";
import './globals.css';

export default function Home() {

  const [user, loading] = useAuthState(auth);
  const [signOut] = useSignOut(auth);
  const [sendEmailVerification] = useSendEmailVerification(auth);
  const [activeTab, setActiveTab] = useState('dashboard');
    const [trackingStreak, setTrackingStreak] = useState(0);
    const [currentBMI, setCurrentBMI] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [bmiHistory, setBmiHistory] = useState([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
      if (!user) return; 
    
      const savedProfile = localStorage.getItem(`userProfile_${user.uid}`);
      const savedHistory = localStorage.getItem(`bmiHistory_${user.uid}`);
    
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
        } catch (err) {
          console.error("Failed to parse profile data:", err);
        }
      }
    
      if (savedHistory) {
        try {
          setBmiHistory(JSON.parse(savedHistory));
        } catch (err) {
          console.error("Failed to parse BMI history:", err);
        }
      }
    }, [user]);
    

    useEffect(() => {
      if (user && userProfile) {
        localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(userProfile));
      }
    }, [user, userProfile]);
    
    useEffect(() => {
      if (user && bmiHistory) {
        localStorage.setItem(`bmiHistory_${user.uid}`, JSON.stringify(bmiHistory));
      }
    }, [user, bmiHistory]);
    

useEffect(() => {
  if (user) {
    console.log("Logged in as:", user.uid);
    console.log("Saved profile:", localStorage.getItem(`userProfile_${user.uid}`));
    console.log("Saved history:", localStorage.getItem(`bmiHistory_${user.uid}`));
  }
}, [user]);


    const [profileData, setProfileData] = useState({
      heightFeet: '',
      heightInches: '',
      heightCm: '',
      weight: '',
      weightUnit: 'kg',
      goal: '',
      targetWeight: ''
    });

    const [calcData, setCalcData] = useState({
      feet: '',
      inches: '',
      cm: '',
      weight: '',
      weightUnit: 'kg'
    });

    const [quickWeight, setQuickWeight] = useState('');
    const [quickWeightUnit, setQuickWeightUnit] = useState('kg');
    const [quickBMIResult, setQuickBMIResult] = useState(null);
    const [bmiResult, setBmiResult] = useState(null);

    const achievements = [
      {
        name: "Getting Started",
        description: "Track your first BMI",
        requirement: 1,
        icon: "fas fa-seedling",
        earned: trackingStreak >= 1
      },
      {
        name: "Consistent Tracker",
        description: "Track BMI for 7 consecutive days",
        requirement: 7,
        icon: "fas fa-calendar-check",
        earned: trackingStreak >= 7
      },
      {
        name: "Silver Badge",
        description: "Track BMI for 10 consecutive days",
        requirement: 10,
        icon: "fas fa-medal",
        earned: trackingStreak >= 10
      },
      {
        name: "Gold Standard",
        description: "Track BMI for 30 consecutive days",
        requirement: 30,
        icon: "fas fa-trophy",
        earned: trackingStreak >= 30
      },
      {
        name: "Health Champion",
        description: "Track BMI for 60 consecutive days",
        requirement: 60,
        icon: "fas fa-crown",
        earned: trackingStreak >= 60
      },
      {
        name: "Immortal Badge",
        description: "Track BMI for 100 consecutive days",
        requirement: 100,
        icon: "fas fa-infinity",
        earned: trackingStreak >= 100
      }
    ];

    const getBMICategory = (bmi) => {
      if (!bmi) return 'Unknown';
      if (bmi < 18.5) return 'Underweight';
      if (bmi < 25) return 'Normal';
      if (bmi < 30) return 'Overweight';
      return 'Obese';
    };

    const convertToMeters = (feet, inches, cm) => {
      if (cm) return cm / 100;
      const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
      return totalInches * 0.0254;
    };

    const convertToKg = (weight, unit) => {
      return unit === 'lbs' ? weight * 0.453592 : weight;
    };

    const calculateBMIValue = (weight, height) => {
      if (!weight || !height) return null;
      return Math.round((weight / (height * height)) * 10) / 10;
    };

    const calculateBMI = () => {
      const height = convertToMeters(calcData.feet, calcData.inches, calcData.cm);
      const weight = convertToKg(calcData.weight, calcData.weightUnit);
      const bmi = calculateBMIValue(weight, height);
      setBmiResult(bmi);
    };

    const calculateQuickBMI = () => {
      if (!userProfile?.heightCm && !userProfile?.heightFeet) {
        alert('Please set up your profile first with height information');
        setActiveTab('profile');
        return;
      }
      const height = convertToMeters(userProfile.heightFeet, userProfile.heightInches, userProfile.heightCm);
      const weight = convertToKg(quickWeight, quickWeightUnit);
      const bmi = calculateBMIValue(weight, height);
      setQuickBMIResult(bmi);
      saveBMIRecord(bmi, quickWeight, quickWeightUnit);
    };

    const handleProfileUpdate = (e) => {
      e.preventDefault();
      setUserProfile(profileData);
      alert('Profile updated successfully!');
    };
    

    const saveBMIRecord = (bmi, weight, weightUnit) => {
      if (!bmi || !weight || !weightUnit) {
        console.warn("Invalid BMI record, skipping save.");
        return;
      }
    
      const newRecord = {
        bmi,
        weight,
        weightUnit,
        category: getBMICategory(bmi),
        date: new Date().toISOString()
      };
    
      setBmiHistory(prev => [newRecord, ...prev]);
      setCurrentBMI(bmi);
      updateTrackingStreak();
    };
    

    const updateTrackingStreak = () => {
      setTrackingStreak(prev => prev + 1);
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString();
    };

    const getTrackingStartDate = () => {
      if (bmiHistory.length === 0) return '--';
      return formatDate(bmiHistory[bmiHistory.length - 1].date);
    };

    const handleSendVerification = async () => {
      setSending(true);
      try {
        await sendEmailVerification();
        alert("Verification email sent!");
      } catch (err) {
        console.error("Error sending verification email:", err);
        alert("Failed to send verification email.");
      } finally {
        setSending(false);
      }
    };
    

  return (
    <div className="page-wrapper">
  {loading ? (
    <IconFidgetSpinner className="spinner" />
  ) : (
    <>
<SignedIn>
  <div className="dashboard-wrapper">
    
    <header className="dashboard-header">
      <div className="user-info">
        <div className="user-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="user-details">
          <h2 className="user-name">Welcome back!</h2>
          <p className="user-email">{user?.email}</p>
          <div className="verification-status">
            {user?.emailVerified ? (
              <span className="verified-badge">
                <i className="fas fa-check-circle"></i> Verified
              </span>
            ) : (
              <span className="not-verified-badge">
                <i className="fas fa-exclamation-circle"></i> Not verified
              </span>
            )}
          </div>
        </div>
        <button onClick={signOut} className="signout-btn">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>

    
    <nav className="dashboard-nav">
      <button 
        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <i className="fas fa-tachometer-alt"></i> Dashboard
      </button>
      <button 
        className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <i className="fas fa-user-cog"></i> Profile
      </button>
      <button 
        className={`nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
        onClick={() => setActiveTab('calculator')}
      >
        <i className="fas fa-calculator"></i> BMI Calculator
      </button>
      <button 
        className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <i className="fas fa-chart-line"></i> History
      </button>
    </nav>

    
    <main className="dashboard-content">
      
      
      {activeTab === 'dashboard' && (
        <div className="dashboard-tab">
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon bmi-icon">
                <i className="fas fa-weight"></i>
              </div>
              <div className="stat-info">
                <h3>Current BMI</h3>
                <p className="stat-value">{currentBMI || '--'}</p>
                <span className="stat-label">{getBMICategory(currentBMI)}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon streak-icon">
                <i className="fas fa-fire"></i>
              </div>
              <div className="stat-info">
                <h3>Current Streak</h3>
                <p className="stat-value">{trackingStreak}</p>
                <span className="stat-label">days tracked</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon goal-icon">
                <i className="fas fa-target"></i>
              </div>
              <div className="stat-info">
                <h3>Goal</h3>
                <p className="stat-value">{userProfile?.goal || 'Not set'}</p>
                <span className="stat-label">current goal</span>
              </div>
            </div>
          </div>

          
          <div className="achievements-section">
            <h3 className="section-title">
              <i className="fas fa-trophy"></i> Achievements
            </h3>
            <div className="badges-grid">
              {achievements.map((achievement, index) => (
                <div key={index} className={`badge ${achievement.earned ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">
                    <i className={achievement.icon}></i>
                  </div>
                  <div className="badge-info">
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    <span className="badge-progress">
                      {achievement.earned ? 'Completed!' : `${trackingStreak}/${achievement.requirement} days`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          <div className="quick-bmi-section">
            <h3 className="section-title">
              <i className="fas fa-zap"></i> Quick BMI Check
            </h3>
            <div className="quick-bmi-card">
              <div className="input-group">
                <input
                  type="number"
                  placeholder="Weight"
                  value={quickWeight}
                  onChange={(e) => setQuickWeight(e.target.value)}
                  className="quick-input"
                />
                <select 
                  value={quickWeightUnit} 
                  onChange={(e) => setQuickWeightUnit(e.target.value)}
                  className="unit-select"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              <button onClick={calculateQuickBMI} className="quick-calc-btn">
                Calculate & Track
              </button>
              {quickBMIResult && (
                <div className="quick-result">
                  <p>BMI: <strong>{quickBMIResult}</strong></p>
                  <span className={`bmi-category ${getBMICategory(quickBMIResult).toLowerCase().replace(' ', '-')}`}>
                    {getBMICategory(quickBMIResult)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {activeTab === 'profile' && (
        <div className="profile-tab">
          <div className="profile-card">
            <h3 className="section-title">
              <i className="fas fa-user-edit"></i> Profile Information
            </h3>
            
            <form onSubmit={handleProfileUpdate} className="profile-form">
              
              <div className="form-group">
                <label>Height</label>
                <div className="height-inputs">
                  <div className="height-option">
                    <span>Feet & Inches</span>
                    <div className="feet-inches-group">
                      <input
                        type="number"
                        placeholder="Feet"
                        value={profileData.heightFeet}
                        onChange={(e) => setProfileData({...profileData, heightFeet: e.target.value})}
                        className="height-input"
                      />
                      <input
                        type="number"
                        placeholder="Inches"
                        value={profileData.heightInches}
                        onChange={(e) => setProfileData({...profileData, heightInches: e.target.value})}
                        className="height-input"
                      />
                    </div>
                  </div>
                  
                  <div className="height-divider">OR</div>
                  
                  <div className="height-option">
                    <span>Centimeters</span>
                    <input
                      type="number"
                      placeholder="cm"
                      value={profileData.heightCm}
                      onChange={(e) => setProfileData({...profileData, heightCm: e.target.value})}
                      className="height-input"
                    />
                  </div>
                </div>
              </div>

              
              <div className="form-group">
                <label>Current Weight</label>
                <div className="weight-group">
                  <input
                    type="number"
                    placeholder="Weight"
                    value={profileData.weight}
                    onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                    className="auth-input"
                    step="0.1"
                  />
                  <select 
                    value={profileData.weightUnit} 
                    onChange={(e) => setProfileData({...profileData, weightUnit: e.target.value})}
                    className="unit-select"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              
              <div className="form-group">
                <label>Health Goal</label>
                <div className="goal-options">
                  <label className="goal-option">
                    <input
                      type="radio"
                      name="goal"
                      value="weight_loss"
                      checked={profileData.goal === 'weight_loss'}
                      onChange={(e) => setProfileData({...profileData, goal: e.target.value})}
                    />
                    <div className="goal-card">
                      <i className="fas fa-arrow-down"></i>
                      <span>Weight Loss</span>
                    </div>
                  </label>
                  
                  <label className="goal-option">
                    <input
                      type="radio"
                      name="goal"
                      value="weight_gain"
                      checked={profileData.goal === 'weight_gain'}
                      onChange={(e) => setProfileData({...profileData, goal: e.target.value})}
                    />
                    <div className="goal-card">
                      <i className="fas fa-arrow-up"></i>
                      <span>Weight Gain</span>
                    </div>
                  </label>
                  
                  <label className="goal-option">
                    <input
                      type="radio"
                      name="goal"
                      value="maintain"
                      checked={profileData.goal === 'maintain'}
                      onChange={(e) => setProfileData({...profileData, goal: e.target.value})}
                    />
                    <div className="goal-card">
                      <i className="fas fa-balance-scale"></i>
                      <span>Maintain</span>
                    </div>
                  </label>
                </div>
              </div>

              
              <div className="form-group">
                <label>Target Weight (Optional)</label>
                <div className="weight-group">
                  <input
                    type="number"
                    placeholder="Target weight"
                    value={profileData.targetWeight}
                    onChange={(e) => setProfileData({...profileData, targetWeight: e.target.value})}
                    className="auth-input"
                    step="0.1"
                  />
                  <select 
                    value={profileData.weightUnit} 
                    className="unit-select"
                    disabled
                  >
                    <option value={profileData.weightUnit}>{profileData.weightUnit}</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="profile-save-btn">
                <i className="fas fa-save"></i> Save Profile
              </button>
            </form>

            {!user?.emailVerified && (
              <div className="verification-prompt">
                <div className="verification-card">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <h4>Verify your email to unlock all features</h4>
                    <p>Email verification helps secure your account and enables progress tracking.</p>
                    <button
                      onClick={handleSendVerification}
                      disabled={sending}
                      className="verify-btn"
                    >
                      {sending ? "Sending..." : "Send Verification Email"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      
      {activeTab === 'calculator' && (
        <div className="calculator-tab">
          <div className="calculator-card">
            <h3 className="section-title">
              <i className="fas fa-calculator"></i> BMI Calculator
            </h3>
            
            <div className="calculator-content">
              <div className="calc-inputs">
                <div className="calc-group">
                  <label>Height</label>
                  <div className="height-calc-inputs">
                    <input
                      type="number"
                      placeholder="Feet"
                      value={calcData.feet}
                      onChange={(e) => setCalcData({...calcData, feet: e.target.value})}
                      className="calc-input"
                    />
                    <input
                      type="number"
                      placeholder="Inches"
                      value={calcData.inches}
                      onChange={(e) => setCalcData({...calcData, inches: e.target.value})}
                      className="calc-input"
                    />
                    <span className="input-divider">OR</span>
                    <input
                      type="number"
                      placeholder="cm"
                      value={calcData.cm}
                      onChange={(e) => setCalcData({...calcData, cm: e.target.value})}
                      className="calc-input"
                    />
                  </div>
                </div>
                
                <div className="calc-group">
                  <label>Weight</label>
                  <div className="weight-calc-group">
                    <input
                      type="number"
                      placeholder="Weight"
                      value={calcData.weight}
                      onChange={(e) => setCalcData({...calcData, weight: e.target.value})}
                      className="calc-input"
                      step="0.1"
                    />
                    <select 
                      value={calcData.weightUnit} 
                      onChange={(e) => setCalcData({...calcData, weightUnit: e.target.value})}
                      className="unit-select"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={calculateBMI} className="calculate-btn">
                <i className="fas fa-calculator"></i> Calculate BMI
              </button>

              {bmiResult && (
                <div className="bmi-result">
                  <div className="result-display">
                    <h4>Your BMI</h4>
                    <div className="bmi-value">{bmiResult}</div>
                    <div className={`bmi-category ${getBMICategory(bmiResult).toLowerCase().replace(' ', '-')}`}>
                      {getBMICategory(bmiResult)}
                    </div>
                  </div>
                  
                  <div className="bmi-chart">
                    <div className="chart-item underweight">
                      <span>Underweight</span>
                      <span>&lt; 18.5</span>
                    </div>
                    <div className="chart-item normal">
                      <span>Normal</span>
                      <span>18.5 - 24.9</span>
                    </div>
                    <div className="chart-item overweight">
                      <span>Overweight</span>
                      <span>25.0 - 29.9</span>
                    </div>
                    <div className="chart-item obese">
                      <span>Obese</span>
                      <span>≥ 30.0</span>
                    </div>
                  </div>
                  
                  <button onClick={saveBMIRecord} className="save-record-btn">
                    <i className="fas fa-save"></i> Save to History
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {activeTab === 'history' && (
        <div className="history-tab">
          <div className="history-card">
            <h3 className="section-title">
              <i className="fas fa-chart-line"></i> BMI History
            </h3>
            
            {bmiHistory.length > 0 ? (
              <div className="history-content">
                <div className="history-stats">
                  <div className="history-stat">
                    <span>Total Records</span>
                    <strong>{bmiHistory.length}</strong>
                  </div>
                  <div className="history-stat">
                    <span>Latest BMI</span>
                    <strong>{bmiHistory[0]?.bmi || '--'}</strong>
                  </div>
                  <div className="history-stat">
                    <span>Tracking Since</span>
                    <strong>{getTrackingStartDate()}</strong>
                  </div>
                </div>
                
                <div className="history-list">
                  {bmiHistory.map((record, index) => (
                    <div key={index} className="history-item">
                      <div className="history-date">
                        <i className="fas fa-calendar"></i>
                        {formatDate(record.date)}
                      </div>
                      <div className="history-data">
                        <div className="history-bmi">
                          <span>BMI: <strong>{record.bmi}</strong></span>
                          <span className={`category ${record.category.toLowerCase().replace(' ', '-')}`}>
                            {record.category}
                          </span>
                        </div>
                        <div className="history-weight">
                          Weight: {record.weight} {record.weightUnit}
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="latest-badge">
                          <i className="fas fa-star"></i> Latest
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-history">
                <i className="fas fa-chart-line"></i>
                <h4>No BMI records yet</h4>
                <p>Start tracking your BMI to see your progress over time</p>
                <button 
                  onClick={() => setActiveTab('calculator')} 
                  className="start-tracking-btn"
                >
                  Calculate Your First BMI
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  </div>
</SignedIn>



  <SignedOut>
  <div className="homepage-wrapper">
  
  <section className="hero-section">
    <div className="hero-content">
      <div className="brand-container">
        <h1 className="brand-title">HealthTracker</h1>
        <p className="brand-subtitle">Your personal wellness companion</p>
      </div>
      
      <div className="hero-text">
        <h2 className="hero-heading">Take control of your health journey</h2>
        <p className="hero-description">
          Monitor your daily activities, track your progress, and achieve your wellness goals 
          with our intuitive health tracking platform.
        </p>
      </div>
      
      <div className="hero-actions">
        <a href="/sign-up" className="cta-primary">Get Started</a>
        <a href="/sign-in" className="cta-secondary">Sign In</a>
      </div>
    </div>
  </section>


  <section className="features-section">
    <div className="features-container">
      <h3 className="section-title">Why Choose HealthTracker?</h3>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h4 className="feature-title">Progress Tracking</h4>
          <p className="feature-description">
            Visualize your health journey with detailed charts and analytics
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <h4 className="feature-title">Health Monitoring</h4>
          <p className="feature-description">
            Track vital signs, symptoms, and daily health metrics effortlessly
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-bell"></i>
          </div>
          <h4 className="feature-title">Smart Reminders</h4>
          <p className="feature-description">
            Never miss medications or appointments with intelligent notifications
          </p>
        </div>
      </div>
    </div>
  </section>
</div>

  <nav className="glass-navbar">
    <div className="navbar-container">
      <div className="navbar-wrapper">
        <div id="navMenu" className="nav-menu">
          <a href="#" className="nav-link">
            <i className="fas fa-home"></i> Home
          </a>
          <a href="#" className="nav-link hidden" id="dashboardNav">
            <i className="fas fa-chart-line"></i> Dashboard
          </a>
          <a href="#" className="nav-link hidden" id="profileNav">
            <i className="fas fa-user"></i> Profile
          </a>
          <a href="/sign-in" className="nav-link">
            <i className="fas fa-sign-in-alt"></i> Login
          </a>
          <a href="/sign-up" className="nav-link">
            <i className="fas fa-sign-in-alt"></i> Create Account
          </a>
          <a href="/" className="nav-link hidden" id="logoutNav">
            <i className="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </div>
    </div>
  </nav>
</SignedOut>



        </>
      )}
    </div>
  );
}
