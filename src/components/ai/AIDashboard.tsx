'use client';

import React, { useState, useEffect } from 'react';
import { 
  CopilotResponse,
  PeakShiftOffer
} from '@/lib/types';
import toast from 'react-hot-toast';
import styles from './AIDashboard.module.scss';

interface AIDashboardProps {
  className?: string;
}

export default function AIDashboard({ className }: AIDashboardProps) {
  const [activeTab, setActiveTab] = useState<'copilot' | 'peak' | 'analytics'>('copilot');
  const [copilotResponse, setCopilotResponse] = useState<CopilotResponse | null>(null);
  const [peakOffers, setPeakOffers] = useState<PeakShiftOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);


  // Process copilot request
  const processCopilotRequest = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current plan data from localStorage
      let currentPlan = null;
      let currentSchedule = null;
      
      if (typeof window !== 'undefined') {
        try {
          const savedPlan = window.localStorage.getItem('induction_optimizer_results');
          const savedSchedule = window.localStorage.getItem('tomorrows_plan_schedule');
          
          if (savedPlan) {
            currentPlan = JSON.parse(savedPlan);
          }
          if (savedSchedule) {
            currentSchedule = JSON.parse(savedSchedule);
          }
        } catch (e) {
          console.warn('Failed to load plan data:', e);
        }
      }

      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: {
            affectedTrains: [],
            affectedStations: [],
            timeWindow: {
              start: new Date().toISOString(),
              end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
            },
            currentPlan,
            currentSchedule
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setCopilotResponse(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to process copilot request');
    } finally {
      setIsLoading(false);
    }
  };

  // Get peak management analytics
  const getPeakAnalytics = async () => {
    try {
      const response = await fetch('/api/ai/peak-management?action=analytics');
      const result = await response.json();
      if (result.success) {
        // Handle analytics data
        console.log('Peak analytics:', result.data);
      }
    } catch (err) {
      console.error('Failed to get peak analytics:', err);
    }
  };

  // Approve changes and apply to plan
  const approveChanges = async () => {
    if (!copilotResponse?.modifiedSchedule) {
      setError('No changes to approve');
      return;
    }

    setIsApproving(true);
    setError(null);

    try {
      // Update localStorage with modified schedule
      if (typeof window !== 'undefined') {
        // Save the modified schedule
        window.localStorage.setItem('tomorrows_plan_schedule', JSON.stringify(copilotResponse.modifiedSchedule));
        
        // Update the plan results if we have changes
        if (copilotResponse.preview.changes.length > 0) {
          const currentPlan = JSON.parse(window.localStorage.getItem('induction_optimizer_results') || '[]');
          
          // Apply changes to the plan
          const updatedPlan = currentPlan.map((train: any) => {
            const change = copilotResponse.preview.changes.find(c => 
              c.trainId === train.trainId || c.trainId === train.train_id
            );
            
            if (change) {
              return {
                ...train,
                action: change.action,
                decision: change.action,
                reason: change.reason,
                score: change.score
              };
            }
            return train;
          });
          
          // Add new trains if any
          const newTrains = copilotResponse.preview.changes.filter(change => 
            change.action === 'revenue' && !currentPlan.some((train: any) => 
              train.trainId === change.trainId || train.train_id === change.trainId
            )
          );
          
          newTrains.forEach(change => {
            updatedPlan.push({
              trainId: change.trainId,
              train_id: change.trainId,
              action: change.action,
              decision: change.action,
              reason: change.reason,
              score: change.score
            });
          });
          
          window.localStorage.setItem('induction_optimizer_results', JSON.stringify(updatedPlan));
        }
        
        // Show success notification
        setError(null);
        setNotification({
          type: 'success',
          message: '✅ Tomorrow\'s plan has been modified successfully!'
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
        
        // Clear the response
        setCopilotResponse(null);
        
        // Optionally refresh the page to show updated data
        // window.location.reload();
      }
    } catch (err) {
      setError('Failed to approve changes');
      console.error('Approval error:', err);
    } finally {
      setIsApproving(false);
    }
  };

  // Reject changes
  const rejectChanges = () => {
    setCopilotResponse(null);
    setError(null);
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      getPeakAnalytics();
    }
  }, [activeTab]);

  return (
    <div className={`${styles.dashboard} ${className || ''}`}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${styles[`notification${notification.type}`]}`}>
          <span>{notification.message}</span>
          <button 
            className={styles.notificationClose}
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className={styles.header}>
        <h1>AI Operations Management</h1>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'copilot' ? styles.active : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            Operations Copilot
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'peak' ? styles.active : ''}`}
            onClick={() => setActiveTab('peak')}
          >
            Peak Management
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'copilot' && (
          <CopilotTab 
            response={copilotResponse}
            isLoading={isLoading}
            error={error}
            onProcess={processCopilotRequest}
            onApprove={approveChanges}
            onReject={rejectChanges}
            isApproving={isApproving}
          />
        )}

        {activeTab === 'peak' && (
          <PeakManagementTab 
            offers={peakOffers}
            onUpdateOffers={setPeakOffers}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}
      </div>
    </div>
  );
}


// Copilot Tab Component
function CopilotTab({ 
  response, 
  isLoading, 
  error, 
  onProcess,
  onApprove,
  onReject,
  isApproving
}: {
  response: CopilotResponse | null;
  isLoading: boolean;
  error: string | null;
  onProcess: (prompt: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
}) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onProcess(prompt);
      setPrompt('');
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2>Operations Copilot</h2>
        <p>Natural language interface for real-time operations management</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.copilotForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="prompt">Enter your operational request:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Withdraw train 01 due to technical issue' or 'Short turn train 05 at Station X'"
            rows={3}
            disabled={isLoading}
          />
        </div>
        
        <div className={styles.examplePrompts}>
          <h4>💡 Example Commands:</h4>
          <div className={styles.promptExamples}>
            <button 
              type="button" 
              className={styles.exampleButton}
              onClick={() => setPrompt('Withdraw train 01 due to technical issue')}
            >
              Withdraw Train
            </button>
            <button 
              type="button" 
              className={styles.exampleButton}
              onClick={() => setPrompt('Short turn train 05 at Aluva station')}
            >
              Short Turn
            </button>
            <button 
              type="button" 
              className={styles.exampleButton}
              onClick={() => setPrompt('Fill service gap with standby train')}
            >
              Gap Fill
            </button>
            <button 
              type="button" 
              className={styles.exampleButton}
              onClick={() => setPrompt('Skip Kaloor station due to obstruction')}
            >
              Skip Stop
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className={styles.primaryButton}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Processing...' : 'Process Request'}
        </button>
      </form>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {response && (
        <div className={styles.copilotResponse}>
          <h3>AI Response</h3>
          <div className={styles.responseContent}>
            <div className={styles.reasoning}>
              <strong>Reasoning:</strong> {response.preview.reasoning}
            </div>
            
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span className={styles.label}>Impact:</span>
                <span className={styles.value}>{response.preview.metrics.impact}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>Feasibility:</span>
                <span className={styles.value}>{(response.preview.metrics.feasibility * 100).toFixed(1)}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>Estimated Delay:</span>
                <span className={styles.value}>{response.preview.metrics.estimatedDelay} min</span>
              </div>
            </div>

            {response.preview.modifiedSchedule && (
              <div className={styles.scheduleChanges}>
                <h4>📅 Modified Schedule Preview</h4>
                <div className={styles.scheduleTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Train</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {response.preview.modifiedSchedule.slice(0, 10).map((trip: any, index: number) => (
                        <tr key={index} className={trip.status !== 'Run' ? styles.modifiedTrip : ''}>
                          <td>{trip.trainNumber}</td>
                          <td>{trip.origin}</td>
                          <td>{trip.destination}</td>
                          <td>{trip.departure}</td>
                          <td>{trip.arrival}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${trip.status === 'Run' ? styles.statusNormal : styles.statusModified}`}>
                              {trip.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {response.preview.modifiedSchedule.length > 10 && (
                    <p className={styles.moreTrips}>
                      ... and {response.preview.modifiedSchedule.length - 10} more trips
                    </p>
                  )}
                </div>
              </div>
            )}

            {response.alternatives.length > 0 && (
              <div className={styles.alternatives}>
                <h4>Alternative Options:</h4>
                {response.alternatives.map((alt, index) => (
                  <div key={index} className={styles.alternative}>
                    <strong>{alt.option}:</strong> {alt.description}
                    <ul>
                      {alt.tradeoffs.map((tradeoff, i) => (
                        <li key={i}>{tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {response.requiresApproval && (
              <div className={styles.approvalRequired}>
                <strong>⚠️ This action requires approval before implementation.</strong>
                <div className={styles.approvalActions}>
                  <button 
                    className={styles.approveButton}
                    onClick={onApprove}
                    disabled={isApproving}
                  >
                    {isApproving ? 'Applying...' : 'Approve Changes'}
                  </button>
                  <button 
                    className={styles.rejectButton}
                    onClick={onReject}
                    disabled={isApproving}
                  >
                    Reject Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Peak Management Tab Component
function PeakManagementTab({ 
  offers, 
  onUpdateOffers 
}: {
  offers: PeakShiftOffer[];
  onUpdateOffers: (offers: PeakShiftOffer[]) => void;
}) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [sampleUsers] = useState([
    {
      id: 'user_001',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      rewardPoints: 145,
      flexibilityScore: 0.8,
      lastTrip: 'Aluva to Thykoodam',
      peakShiftEligible: true
    },
    {
      id: 'user_002', 
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      rewardPoints: 89,
      flexibilityScore: 0.6,
      lastTrip: 'Edapally to Kaloor',
      peakShiftEligible: true
    },
    {
      id: 'user_003',
      name: 'Anita Menon',
      email: 'anita.menon@email.com', 
      rewardPoints: 203,
      flexibilityScore: 0.9,
      lastTrip: 'Kalamassery to Vyttila',
      peakShiftEligible: true
    },
    {
      id: 'user_004',
      name: 'Vikram Nair',
      email: 'vikram.nair@email.com',
      rewardPoints: 67,
      flexibilityScore: 0.4,
      lastTrip: 'Maharaja\'s to Ernakulam South',
      peakShiftEligible: false
    },
    {
      id: 'user_005',
      name: 'Sneha Patel',
      email: 'sneha.patel@email.com',
      rewardPoints: 178,
      flexibilityScore: 0.7,
      lastTrip: 'Kaloor to Thykoodam',
      peakShiftEligible: true
    }
  ]);

  const handleSendNotification = (userId: string, userName: string) => {
    // Simulate sending notification
    toast.success(`Notification sent successfully to ${userName}!`, {
      duration: 3000,
      style: {
        background: '#10b981',
        color: 'white',
        fontWeight: '500'
      }
    });
  };

  useEffect(() => {
    // Fetch peak management analytics
    fetch('/api/ai/peak-management?action=analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnalytics(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch analytics:', err));
  }, []);

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2>Peak Management & Rider Rewards</h2>
        <p>AI-driven demand shaping and rider engagement</p>
      </div>

      {analytics && (
        <div className={styles.analytics}>
          <h3>Peak Management Analytics</h3>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.label}>Total Offers:</span>
              <span className={styles.value}>{analytics.totalOffers}</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Acceptance Rate:</span>
              <span className={styles.value}>{(analytics.acceptanceRate * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Average Time Shift:</span>
              <span className={styles.value}>{analytics.averageTimeShift.toFixed(1)} min</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Total Reward Points:</span>
              <span className={styles.value}>{analytics.totalRewardPoints}</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Peak Reduction:</span>
              <span className={styles.value}>{(analytics.peakReduction * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Sample Users Section */}
      <div className={styles.sampleUsersSection}>
        <h3>Sample Users & Peak Shift Notifications</h3>
        <p>Send personalized peak shift offers to eligible commuters</p>
        
        <div className={styles.usersGrid}>
          {sampleUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={styles.userDetails}>
                  <h4 className={styles.userName}>{user.name}</h4>
                  <p className={styles.userEmail}>{user.email}</p>
                  <div className={styles.userStats}>
                    <span className={styles.rewardPoints}>
                      🏆 {user.rewardPoints} pts
                    </span>
                    <span className={styles.flexibilityScore}>
                      Flexibility: {(user.flexibilityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className={styles.lastTrip}>Last trip: {user.lastTrip}</p>
                </div>
              </div>
              
              <div className={styles.userActions}>
                <button
                  className={`${styles.sendNotificationBtn} ${user.peakShiftEligible ? styles.eligible : styles.notEligible}`}
                  onClick={() => handleSendNotification(user.id, user.name)}
                  disabled={!user.peakShiftEligible}
                >
                  {user.peakShiftEligible ? 'Send Notification' : 'Not Eligible'}
                </button>
                {user.peakShiftEligible && (
                  <span className={styles.eligibleBadge}>✓ Eligible</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.peakFeatures}>
        <div className={styles.feature}>
          <h4>🎯 Smart Peak Shifting</h4>
          <p>AI analyzes rider behavior and offers personalized time shifts to reduce crowding during peak hours.</p>
        </div>
        <div className={styles.feature}>
          <h4>🏆 Reward System</h4>
          <p>Riders earn points for accepting peak shift offers and complying with suggested times.</p>
        </div>
        <div className={styles.feature}>
          <h4>📊 Demand Analytics</h4>
          <p>Real-time analysis of peak patterns and rider flexibility to optimize service planning.</p>
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Fetch comprehensive analytics
    Promise.all([
      fetch('/api/ai/peak-management?action=analytics').then(res => res.json()),
      // Add more analytics endpoints as needed
    ]).then(([peakData]) => {
      setAnalytics({
        peak: peakData.success ? peakData.data : null
      });
    }).catch(err => console.error('Failed to fetch analytics:', err));
  }, []);

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2>AI System Analytics</h2>
        <p>Comprehensive insights into AI-driven operations</p>
      </div>

      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <h3>System Performance</h3>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.label}>AI Model Accuracy:</span>
              <span className={styles.value}>94.2%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Average Response Time:</span>
              <span className={styles.value}>2.3s</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Constraint Satisfaction:</span>
              <span className={styles.value}>99.8%</span>
            </div>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <h3>Operational Impact</h3>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.label}>Punctuality Improvement:</span>
              <span className={styles.value}>+12.5%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Energy Savings:</span>
              <span className={styles.value}>8.3%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Maintenance Efficiency:</span>
              <span className={styles.value}>+18.7%</span>
            </div>
          </div>
        </div>

        {analytics?.peak && (
          <div className={styles.analyticsCard}>
            <h3>Peak Management</h3>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span className={styles.label}>Peak Reduction:</span>
                <span className={styles.value}>{(analytics.peak.peakReduction * 100).toFixed(1)}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>Rider Engagement:</span>
                <span className={styles.value}>{(analytics.peak.acceptanceRate * 100).toFixed(1)}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.label}>Reward Points Issued:</span>
                <span className={styles.value}>{analytics.peak.totalRewardPoints}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
