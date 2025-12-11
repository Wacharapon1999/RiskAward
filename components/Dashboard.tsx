/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import { AllScores } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, Award, Target, BarChart3, PieChart, Loader2 } from 'lucide-react';

interface DashboardProps {
  currentDivision: string;
  allScores: AllScores;
  isAdmin: boolean;
  divisionsList: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ currentDivision, allScores, isAdmin, divisionsList }) => {
  const [rankingLimit, setRankingLimit] = useState<number>(10);
  
  if (!currentDivision || !allScores) {
      return (
          <div className="h-96 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
      );
  }

  const fmt = (num: number) => parseFloat(num.toFixed(2));

  // --- DATA PREP ---
  const chartData = [1,2,3,4].map(q => {
      const s = allScores[currentDivision]?.quarters?.[q]?.scores;
      let total = 0;
      if (s) total = (Object.values(s) as number[]).reduce((a, b) => a + b, 0);
      return { name: `Q${q}`, score: fmt(total) };
  });

  const categories = [
      {id:1,n:'แบบฟอร์ม'},{id:2,n:'ความครอบคลุม'},{id:3,n:'เป้าหมาย'},{id:4,n:'ความร่วมมือ'},{id:5,n:'ความสำเร็จ'}
  ];
  const radarData = categories.map(c => {
      let sum=0, cnt=0;
      [1,2,3,4].forEach(q => {
          const v = allScores[currentDivision]?.quarters?.[q]?.scores?.[c.id as 1|2|3|4|5];
          if (v !== undefined && (c.id!==5 || q===4)) { sum+=v; cnt++; }
      });
      return { subject: c.n, A: cnt>0?fmt(sum/cnt):0, fullMark:20 };
  });
  const sortedRadar = [...radarData].sort((a,b)=>b.A-a.A);
  const best = sortedRadar[0];
  const weak = sortedRadar[sortedRadar.length-1];

  let rankingData = divisionsList
      .filter(d => d !== "คะแนนเฉลี่ยทั้งหมด")
      .map(d => {
          let total = 0;
          let quarters: Record<number, number> = {};
          [1,2,3,4].forEach(q => {
              const s = allScores[d]?.quarters?.[q]?.scores;
              let qTotal = 0;
              if(s) qTotal = (Object.values(s) as number[]).reduce((a,b)=>a+b,0);
              quarters[q] = fmt(qTotal);
              total += qTotal;
          });
          return { name: d, total: fmt(total), quarters };
      })
      .sort((a,b) => b.total - a.total);

  if (rankingLimit > 0) {
      rankingData = rankingData.slice(0, rankingLimit);
  }

  // --- COMPONENTS ---

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                  <h3 className={`text-2xl font-bold ${color} group-hover:scale-105 transition-transform origin-left`}>{value}</h3>
                  {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
              </div>
              <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-opacity-80 transition-colors`}>
                  <Icon className={`w-6 h-6 ${color}`} />
              </div>
          </div>
      </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
          return (
              <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-xl z-50">
                  <p className="text-sm font-bold text-gray-900 mb-1">{label || payload[0].name}</p>
                  <p className="text-sm text-blue-600 font-bold">
                      {typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value} คะแนน
                  </p>
              </div>
          );
      }
      return null;
  };

  return (
      <div className="space-y-8 animate-fade-in pb-12">
          <div className="flex items-center justify-between">
              <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard ภาพรวม</h2>
                  <p className="text-gray-500 text-sm mt-1">วิเคราะห์ข้อมูล: <span className="font-semibold text-blue-600">{currentDivision}</span></p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="คะแนนรวมสะสม" value={fmt(chartData.reduce((a,b)=>a+b.score,0))} sub="จากคะแนนเต็ม 340" icon={TrendingUp} color="text-blue-600" />
              <StatCard title="เฉลี่ยต่อไตรมาส" value={fmt(chartData.reduce((a,b)=>a+b.score,0)/4)} sub="คะแนนเฉลี่ย 4 ไตรมาส" icon={BarChart3} color="text-gray-700" />
              <StatCard title="จุดแข็ง (Best Skill)" value={best?.subject||'-'} sub={`${best?.A||0}/20 คะแนน`} icon={Award} color="text-emerald-600" />
              <StatCard title="ควรพัฒนา (Weakness)" value={weak?.subject||'-'} sub={`${weak?.A||0}/20 คะแนน`} icon={Target} color="text-rose-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      แนวโน้มคะแนนรายไตรมาส
                  </h3>
                  <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                              <defs>
                                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1}/>
                                      <stop offset="100%" stopColor="#1e40af" stopOpacity={0.6}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                              <Bar dataKey="score" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                      วิเคราะห์สมรรถนะ (Radar Analysis)
                  </h3>
                  <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
                              <Radar name={currentDivision} dataKey="A" stroke="#e11d48" strokeWidth={3} fill="#e11d48" fillOpacity={0.2} />
                              <Tooltip content={<CustomTooltip />} />
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {isAdmin && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Award className="w-32 h-32 text-gray-900" />
                  </div>
                  <div className="relative z-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                          <div>
                              <h3 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                                  <Award className="w-8 h-8 text-yellow-500" />
                                  Top Performance Ranking
                              </h3>
                              <p className="text-gray-500 text-sm">จัดอันดับหน่วยงานที่มีคะแนนรวมสูงสุดพร้อมรายละเอียด</p>
                          </div>
                          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                              {[3, 10, 0].map(limit => (
                                  <button 
                                      key={limit}
                                      onClick={() => setRankingLimit(limit)}
                                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${rankingLimit === limit ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                                  >
                                      {limit === 0 ? 'ทุกฝ่าย' : `Top ${limit}`}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                          {rankingData.map((item, idx) => (
                              <div key={item.name} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                      <div className="flex items-center gap-4 flex-1">
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-sm border border-gray-100 shrink-0 ${idx===0?'bg-yellow-100 text-yellow-700':idx===1?'bg-gray-100 text-gray-700':idx===2?'bg-orange-100 text-orange-800':'bg-white text-gray-500'}`}>
                                              {idx+1}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <div className="font-bold text-gray-800 text-base truncate mb-1">{item.name}</div>
                                              <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[200px]">
                                                  <div className={`h-full rounded-full ${idx===0?'bg-yellow-400':idx===1?'bg-gray-400':idx===2?'bg-orange-400':'bg-blue-500'}`} style={{width: `${(item.total/340)*100}%`}}></div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="flex items-center justify-between sm:justify-end gap-6">
                                           <div className="text-right shrink-0">
                                               <div className="text-2xl font-bold text-blue-600 leading-none">{item.total}</div>
                                               <div className="text-[10px] text-gray-400 font-medium mt-1">คะแนนรวม</div>
                                           </div>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-50">
                                      {[1,2,3,4].map(q => (
                                          <div key={q} className="flex flex-col items-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                                              <span className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Q{q}</span>
                                              <span className={`text-sm font-bold ${q===4 ? 'text-blue-600' : 'text-gray-700'}`}>
                                                  {item.quarters[q]}
                                              </span>
                                              <span className="text-[9px] text-gray-400">/{q===4?100:80}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};