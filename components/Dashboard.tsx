/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { AllScores } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface DashboardProps {
  currentDivision: string;
  allScores: AllScores;
  isAdmin: boolean;
  divisionsList: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ currentDivision, allScores, isAdmin, divisionsList }) => {
  
  // Safety check: if data isn't ready or division isn't selected
  if (!currentDivision) {
      return (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
              <span className="text-gray-400">กำลังโหลดข้อมูล...</span>
          </div>
      );
  }

  // 1. Prepare Data for Bar Chart (Quarterly Progress)
  const getQuarterlyData = (division: string) => {
    const data = allScores[division];
    const quarters = [1, 2, 3, 4];
    return quarters.map(q => {
       const scores = data?.quarters?.[q]?.scores;
       let total = 0;
       if (scores) {
         total = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
       }
       return { name: `Q${q}`, score: total };
    });
  };

  // 2. Prepare Data for Radar Chart (Strengths/Weaknesses)
  const getRadarData = (division: string) => {
    const data = allScores[division];
    const categories = [
        { id: 1, name: 'แบบฟอร์ม', full: 'การใช้แบบฟอร์ม' },
        { id: 2, name: 'ความครอบคลุม', full: 'ความครอบคลุม' },
        { id: 3, name: 'เป้าหมายชัดเจน', full: 'ความชัดเจนของเป้าหมาย' },
        { id: 4, name: 'ความร่วมมือ', full: 'การให้ความร่วมมือ' },
        { id: 5, name: 'ความสำเร็จ', full: 'ความสำเร็จในการลดความเสี่ยง' },
    ];
    
    // Average score per category across available quarters
    return categories.map(cat => {
       let sum = 0;
       let count = 0;
       [1, 2, 3, 4].forEach(q => {
          const s = data?.quarters?.[q]?.scores?.[cat.id as 1|2|3|4|5];
          // Only count if data exists and for cat 5 only Q4
          if (s !== undefined) {
             if (cat.id !== 5 || q === 4) {
                 sum += s;
                 count++;
             }
          }
       });
       return { 
           subject: cat.name, 
           A: count > 0 ? parseFloat((sum / count).toFixed(1)) : 0, 
           fullMark: 20 
       };
    });
  };

  // 3. Prepare Ranking Data (Admin Only)
  const getRankingData = () => {
    return divisionsList.map(div => {
        const dData = allScores[div];
        let total = 0;
        if (dData) {
            [1, 2, 3, 4].forEach(q => {
                const scores = dData.quarters?.[q]?.scores;
                if (scores) total += (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
            });
        }
        return { name: div, total: total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Top 10
  };

  const chartData = getQuarterlyData(currentDivision);
  const radarData = getRadarData(currentDivision);
  const rankingData = getRankingData();

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span className="bg-blue-600 w-2 h-6 rounded-sm"></span>
        Dashboard ภาพรวมคะแนน
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">แนวโน้มคะแนนรายไตรมาส ({currentDivision})</h3>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="score" name="คะแนนรวม" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Competency Radar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">จุดแข็ง / จุดที่ควรพัฒนา (เฉลี่ย)</h3>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
                  <Radar
                    name={currentDivision}
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Admin Only: Ranking */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">🏆 อันดับคะแนนรวมสูงสุด (Top 10)</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={rankingData}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={180} tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                            {/* Optional: Add labels inside bars if desired */}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );
};