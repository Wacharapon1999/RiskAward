
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import { AllScores } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, Cell
} from 'recharts';
import { TrendingUp, Award, Target, AlertCircle, BarChart3, PieChart, Filter } from 'lucide-react';

interface DashboardProps {
  currentDivision: string;
  allScores: AllScores;
  isAdmin: boolean;
  divisionsList: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ currentDivision, allScores, isAdmin, divisionsList }) => {
  const [rankingLimit, setRankingLimit] = useState<number>(10);
  
  // Loading State
  if (!currentDivision || !allScores) {
      return (
          <div className="flex flex-col items-center justify-center h-96 bg-white/50 rounded-3xl border border-gray-100 backdrop-blur-sm animate-pulse">
              <div className="w-12 h-12 bg-blue-100 rounded-full mb-4"></div>
              <span className="text-gray-400 font-medium">กำลังประมวลผลข้อมูล...</span>
          </div>
      );
  }

  // Helper: Format number
  const fmt = (num: number) => parseFloat(num.toFixed(2));

  // --- DATA PROCESSING ---

  // 1. Quarterly Data
  const getQuarterlyData = (division: string) => {
    const data = allScores[division];
    const quarters = [1, 2, 3, 4];
    return quarters.map(q => {
       const scores = data?.quarters?.[q]?.scores;
       let total = 0;
       if (scores) {
         total = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
       }
       return { name: `ไตรมาส ${q}`, short: `Q${q}`, score: fmt(total) };
    });
  };

  // 2. Radar & Skill Analysis
  const getSkillAnalysis = (division: string) => {
    const data = allScores[division];
    const categories = [
        { id: 1, name: 'แบบฟอร์ม', full: 'การใช้แบบฟอร์ม' },
        { id: 2, name: 'ความครอบคลุม', full: 'ความครอบคลุม' },
        { id: 3, name: 'เป้าหมายชัดเจน', full: 'ความชัดเจนของเป้าหมาย' },
        { id: 4, name: 'ความร่วมมือ', full: 'การให้ความร่วมมือ' },
        { id: 5, name: 'ความสำเร็จ', full: 'ความสำเร็จในการลดความเสี่ยง' },
    ];
    
    const radarData = categories.map(cat => {
       let sum = 0;
       let count = 0;
       [1, 2, 3, 4].forEach(q => {
          const s = data?.quarters?.[q]?.scores?.[cat.id as 1|2|3|4|5];
          if (s !== undefined) {
             if (cat.id !== 5 || q === 4) {
                 sum += s;
                 count++;
             }
          }
       });
       const avg = count > 0 ? sum / count : 0;
       return { 
           subject: cat.name, 
           full: cat.full,
           A: fmt(avg), 
           fullMark: 20 
       };
    });

    // Find Best & Weakest
    const sorted = [...radarData].sort((a, b) => b.A - a.A);
    const best = sorted[0];
    const weak = sorted[sorted.length - 1];

    return { radarData, best, weak };
  };

  // 3. Ranking Data
  const getRankingData = () => {
    let data = divisionsList.map(div => {
        // Skip "Average" in ranking
        if (div === "คะแนนเฉลี่ยทั้งหมด") return null;

        const dData = allScores[div];
        let total = 0;
        if (dData) {
            [1, 2, 3, 4].forEach(q => {
                const scores = dData.quarters?.[q]?.scores;
                if (scores) total += (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
            });
        }
        return { name: div, total: fmt(total) };
    })
    .filter(Boolean) as { name: string; total: number }[];

    // Sort Descending
    data.sort((a, b) => b.total - a.total);

    // Filter Limit
    if (rankingLimit > 0) {
        data = data.slice(0, rankingLimit);
    }

    return data;
  };

  const chartData = getQuarterlyData(currentDivision);
  const { radarData, best, weak } = getSkillAnalysis(currentDivision);
  const rankingData = getRankingData();

  // Calculate Total KPI
  const totalScore = chartData.reduce((acc, curr) => acc + curr.score, 0);
  const averagePerQuarter = totalScore / 4;

  // --- UI COMPONENTS ---

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${bgClass}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
        </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-sm text-blue-600 font-bold">
            {payload[0].value.toFixed(2)} คะแนน
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard ภาพรวม</h2>
            <p className="text-gray-500 text-sm">วิเคราะห์ผลการดำเนินงานด้านการจัดการความเสี่ยง</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium border border-blue-100">
             หน่วยงาน: <span className="font-bold">{currentDivision}</span>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
             title="คะแนนรวมสะสม" 
             value={`${fmt(totalScore)}`} 
             subtext="จากคะแนนเต็ม 340"
             icon={TrendingUp} 
             colorClass="text-blue-600" 
             bgClass="bg-blue-50"
          />
          <StatCard 
             title="เฉลี่ยต่อไตรมาส" 
             value={`${fmt(averagePerQuarter)}`} 
             subtext="คะแนนเฉลี่ย 4 ไตรมาส"
             icon={BarChart3} 
             colorClass="text-indigo-600" 
             bgClass="bg-indigo-50"
          />
          <StatCard 
             title="จุดแข็ง (คะแนนสูงสุด)" 
             value={best?.subject || '-'} 
             subtext={`เฉลี่ย ${best?.A || 0}/20 คะแนน`}
             icon={Award} 
             colorClass="text-emerald-600" 
             bgClass="bg-emerald-50"
          />
          <StatCard 
             title="ควรพัฒนา (คะแนนน้อยสุด)" 
             value={weak?.subject || '-'} 
             subtext={`เฉลี่ย ${weak?.A || 0}/20 คะแนน`}
             icon={Target} 
             colorClass="text-rose-600" 
             bgClass="bg-rose-50"
          />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Trend */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    แนวโน้มคะแนนรายไตรมาส
                </h3>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={40}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="short" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="score" fill="url(#colorScore)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Skill Radar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <PieChart className="w-4 h-4 text-purple-600" />
                    </div>
                    วิเคราะห์สมรรถนะ (5 ด้าน)
                </h3>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
                  <Radar
                    name={currentDivision}
                    dataKey="A"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Admin Only: Leaderboard */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-lg text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 rounded-2xl">
                        <Award className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">Top Performance Ranking</h3>
                        <p className="text-gray-400 text-sm">จัดอันดับหน่วยงานที่มีคะแนนรวมสูงสุด</p>
                    </div>
                </div>
                
                {/* Filter Controls */}
                <div className="bg-gray-700/50 p-1 rounded-lg flex text-xs font-medium border border-gray-600/50">
                    <button 
                        onClick={() => setRankingLimit(3)}
                        className={`px-3 py-1.5 rounded-md transition-all ${rankingLimit === 3 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
                    >
                        Top 3
                    </button>
                    <button 
                        onClick={() => setRankingLimit(10)}
                        className={`px-3 py-1.5 rounded-md transition-all ${rankingLimit === 10 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
                    >
                        Top 10
                    </button>
                    <button 
                        onClick={() => setRankingLimit(0)}
                        className={`px-3 py-1.5 rounded-md transition-all ${rankingLimit === 0 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
                    >
                        ทุกฝ่าย
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={rankingData}
                                    margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                                    barGap={4}
                                    barSize={24}
                                >
                                    <XAxis type="number" hide domain={[0, 340]} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        width={180} 
                                        tick={{fill: '#d1d5db', fontSize: 13}} 
                                        axisLine={false}
                                        tickLine={false}
                                        interval={0}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff'}}
                                    />
                                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                                        {rankingData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={
                                                    index === 0 ? '#fbbf24' : // Gold
                                                    index === 1 ? '#94a3b8' : // Silver
                                                    index === 2 ? '#b45309' : // Bronze
                                                    '#3b82f6' // Others
                                                } 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
