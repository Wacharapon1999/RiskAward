/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { ScoreView } from './components/ScoreView';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { api } from './services/api';
import { User, AllScores, LoginCredentials, ScoreSet, DivisionData } from './types';

function App() {
  // Application State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [scores, setScores] = useState<AllScores>({});
  const [divisions, setDivisions] = useState<string[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'details' | 'dashboard'>('details');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  
  // Admin Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQuarter, setEditQuarter] = useState<number>(1);

  // Initialize data on login
  useEffect(() => {
    if (user) {
        setIsLoading(true);
        
        const loadData = async () => {
            try {
                // Load divisions list first
                let divs = await api.getDivisions();
                
                // Load initial scores
                const divToLoad = user.isAdmin ? 'all' : user.division;
                let data = await api.getScores(divToLoad);

                // --- Calculate Average for Admin ---
                if (user.isAdmin) {
                    const avgName = "คะแนนเฉลี่ยทั้งหมด";
                    const avgData: DivisionData = { quarters: {} };
                    
                    for (let q = 1; q <= 4; q++) {
                        let count = 0;
                        const sums: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        
                        Object.values(data).forEach((d) => {
                             if (d.quarters?.[q]) {
                                 count++;
                                 for(let c=1; c<=5; c++) {
                                    // Cast to any/number to avoid strict type indexing issues in this context
                                    const score = (d.quarters[q].scores as any)[c] || 0;
                                    sums[c] += score;
                                 }
                             }
                        });

                        if (count > 0) {
                            avgData.quarters[q] = {
                                scores: {
                                    1: sums[1] / count,
                                    2: sums[2] / count,
                                    3: sums[3] / count,
                                    4: sums[4] / count,
                                    5: sums[5] / count
                                },
                                comment: `ค่าเฉลี่ยจาก ${count} หน่วยงาน`
                            };
                        }
                    }

                    // Prepend Average to lists
                    divs = [avgName, ...divs];
                    data = { [avgName]: avgData, ...data };
                }

                setDivisions(divs);
                setScores(data);
                
                // Set selected division based on loaded divs (Average will be first for Admin)
                setSelectedDivision(user.isAdmin && divs.length > 0 ? divs[0] : user.division);
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Failed to load initial data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }
  }, [user]);

  const handleLogin = async (creds: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
        const loggedInUser = await api.login(creds);
        if (loggedInUser) {
            setUser(loggedInUser);
            // Default selected division for admin will be set in useEffect
            if (!loggedInUser.isAdmin) {
                setSelectedDivision(loggedInUser.division);
            }
        } else {
            setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    } catch (e) {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setScores({});
    setActiveTab('details');
  };

  const openEditModal = (quarter: number) => {
      setEditQuarter(quarter);
      setIsEditModalOpen(true);
  };

  const handleSaveScore = async (newScores: ScoreSet, newComment: string) => {
      // Optimistic update locally
      const updatedScores = { ...scores };
      if (!updatedScores[selectedDivision]) updatedScores[selectedDivision] = { quarters: {} };
      updatedScores[selectedDivision].quarters[editQuarter] = {
          scores: newScores,
          comment: newComment
      };
      setScores(updatedScores);

      // Call API
      await api.saveScores({
          division: selectedDivision,
          quarter: editQuarter,
          scores: newScores,
          comment: newComment
      });
  };

  if (!user) {
    return <Login onLogin={handleLogin} isLoading={isLoading} error={error} />;
  }

  // Determine current division data for display
  const currentDivisionData = scores[selectedDivision];

  return (
    <Layout 
        user={user} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
    >
        {activeTab === 'details' ? (
            <ScoreView 
                divisionName={selectedDivision}
                data={currentDivisionData}
                isAdmin={user.isAdmin}
                divisionsList={divisions}
                onChangeDivision={setSelectedDivision}
                onEditClick={openEditModal}
            />
        ) : (
            <Dashboard 
                currentDivision={selectedDivision}
                allScores={scores}
                isAdmin={user.isAdmin}
                divisionsList={divisions}
            />
        )}

        {/* Admin Edit Modal */}
        <AdminPanel 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveScore}
            initialData={currentDivisionData}
            divisionName={selectedDivision}
            quarter={editQuarter}
        />
    </Layout>
  );
}

export default App;