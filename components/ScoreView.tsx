/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import { DivisionData, AllScores } from '../types';
import { ChevronDown, Trophy, Info } from 'lucide-react';

interface ScoreViewProps {
  divisionName: string;
  data: DivisionData | undefined;
  isAdmin: boolean;
  divisionsList: string[];
  onChangeDivision: (div: string) => void;
  onEditClick: (quarter: number) => void;
}

const SCORE_CATEGORIES = [
  { id: 1, name: '1. การใช้แบบฟอร์มการประเมินความเสี่ยง', max: 20 },
  { id: 2, name: '2. ความครอบคลุมในการระบุความเสี่ยง', max: 20 },
  { id: 3, name: '3. ความชัดเจนของเป้าหมายและแผนจัดการ', max: 20 },
  { id: 4, name: '4. การให้ความร่วมมือและการส่งรายงาน', max: 20 },
  { id: 5, name: '5. ความสำเร็จในการลดความเสี่ยง (เฉพาะ Q4)', max: 20, q4Only: true },
];

export const ScoreView: React.FC<ScoreViewProps> = ({ 
  divisionName, 
  data, 
  isAdmin, 
  divisionsList, 
  onChangeDivision,
  onEditClick
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'summary'>('summary');

  // Helper to format number to fixed 2 decimal places (returns string for display)
  const fmt = (num: number) => num.toFixed(2);

  // Helper to safely get score
  const getScore = (q: number, catId: number) => {
    return data?.quarters?.[q]?.scores?.[catId as 1|2|3|4|5] ?? '-';
  };

  // Helper to calculate total
  const getQuarterTotal = (q: number) => {
    const scores = data?.quarters?.[q]?.scores;
    if (!scores) return 0;
    return (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
  };

  const grandTotal = [1, 2, 3, 4].reduce((sum, q) => sum + getQuarterTotal(q), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">หน่วยงาน</h2>
            {isAdmin ? (
               <div className="relative mt-1">
                 <select 
                    value={divisionName}
                    onChange={(e) => onChangeDivision(e.target.value)}
                    className="appearance-none block w-full pl-3 pr-10 py-2 text-xl font-bold text-gray-900 bg-white border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 transition-colors cursor-pointer"
                 >
                    {divisionsList.map(div => (
                        <option key={div} value={div}>{div}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-2 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
               </div>
            ) : (
                <div className="text-2xl font-bold text-gray-900 mt-1">{divisionName}</div>
            )}
          </div>
          
          <div className="flex items-center gap-4 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100">
             <div className="p-2 bg-blue-100 rounded-full">
                <Trophy className="w-6 h-6 text-blue-600" />
             </div>
             <div>
                 <div className="text-sm text-blue-600 font-medium">คะแนนรวมสะสม</div>
                 {/* แสดงทศนิยม 2 ตำแหน่ง และตัวหารเป็น 340 */}
                 <div className="text-2xl font-bold text-blue-800">{fmt(grandTotal)} <span className="text-sm font-normal text-blue-600">/ 340</span></div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs for Quarters */}
      <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
         <button 
            onClick={() => setSelectedQuarter('summary')}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedQuarter === 'summary' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
         >
            ภาพรวมทุกไตรมาส
         </button>
         {[1, 2, 3, 4].map(q => (
             <button 
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedQuarter === q ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
             >
                ไตรมาสที่ {q}
             </button>
         ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {selectedQuarter === 'summary' ? (
           // Summary Table View
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">หัวข้อการประเมิน</th>
                   <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">คะแนนเต็ม</th>
                   {[1,2,3,4].map(q => (
                       <th key={q} scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Q{q}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {SCORE_CATEGORIES.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-500 bg-gray-50/50">{cat.max}</td>
                        {[1,2,3,4].map(q => {
                            const score = getScore(q, cat.id);
                            return (
                                <td key={q} className="px-6 py-4 text-sm text-center text-gray-700">
                                    {cat.q4Only && q !== 4 ? <span className="text-gray-300">-</span> : (typeof score === 'number' ? fmt(score) : score)}
                                </td>
                            );
                        })}
                    </tr>
                 ))}
                 <tr className="bg-blue-50/50 font-bold text-blue-900">
                    <td className="px-6 py-4">คะแนนรวม</td>
                    <td className="px-6 py-4 text-center text-gray-400">-</td>
                    {[1,2,3,4].map(q => {
                        const maxScore = q === 4 ? 100 : 80;
                        return (
                            <td key={q} className="px-6 py-4 text-center">
                                <div>{fmt(getQuarterTotal(q))}</div>
                                <div className="text-xs font-normal text-blue-600/70">เต็ม {maxScore}</div>
                            </td>
                        );
                    })}
                 </tr>
               </tbody>
             </table>
           </div>
        ) : (
            // Individual Quarter View with Comments and Actions
            <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        รายละเอียดคะแนน ไตรมาสที่ {selectedQuarter}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            Total: {fmt(getQuarterTotal(selectedQuarter as number))}
                        </span>
                    </h3>
                    {/* Hide Edit button if viewing Average */}
                    {isAdmin && divisionName !== 'คะแนนเฉลี่ยทั้งหมด' && (
                        <button 
                            onClick={() => onEditClick(selectedQuarter as number)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            แก้ไขคะแนน / คอมเมนต์
                        </button>
                    )}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Score List */}
                     <div className="lg:col-span-2 space-y-4">
                        {SCORE_CATEGORIES.map(cat => {
                             if (cat.q4Only && selectedQuarter !== 4) return null;
                             const score = getScore(selectedQuarter as number, cat.id);
                             const percentage = typeof score === 'number' ? (score / cat.max) * 100 : 0;
                             
                             return (
                                <div key={cat.id} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                        <span className="font-bold text-gray-900">{typeof score === 'number' ? fmt(score) : score} <span className="text-gray-400 text-xs font-normal">/ {cat.max}</span></span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                             )
                        })}
                     </div>

                     {/* Comments Box */}
                     <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 h-fit">
                         <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            สรุปผลและข้อเสนอแนะ
                         </h4>
                         <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {data?.quarters?.[selectedQuarter as number]?.comment || "ไม่มีข้อมูลคอมเมนต์"}
                         </p>
                     </div>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};