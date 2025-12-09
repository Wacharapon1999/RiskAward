/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { DivisionData, ScoreSet } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scores: ScoreSet, comment: string) => Promise<void>;
  initialData: DivisionData | undefined;
  divisionName: string;
  quarter: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    isOpen, onClose, onSave, initialData, divisionName, quarter 
}) => {
  const [scores, setScores] = useState<ScoreSet>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        const qData = initialData?.quarters?.[quarter];
        if (qData) {
            setScores(qData.scores);
            setComment(qData.comment || '');
        } else {
            setScores({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
            setComment('');
        }
    }
  }, [isOpen, initialData, quarter]);

  if (!isOpen) return null;

  const handleScoreChange = (cat: number, val: string) => {
      const num = parseInt(val) || 0;
      setScores(prev => ({ ...prev, [cat]: Math.min(20, Math.max(0, num)) })); // Clamp 0-20
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      await onSave(scores, comment);
      setIsSaving(false);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-gray-800">แก้ไขคะแนน</h3>
                <p className="text-sm text-gray-600">{divisionName} - ไตรมาสที่ {quarter}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
                {[1, 2, 3, 4].map(id => (
                    <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                        <label className="text-sm font-medium text-gray-700 flex-1">
                            {id}. {getLabel(id)} (20)
                        </label>
                        <input 
                            type="number" 
                            min="0" max="20"
                            value={scores[id as 1|2|3|4] || ''}
                            onChange={(e) => handleScoreChange(id, e.target.value)}
                            className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                ))}
                
                {/* Score 5 only for Q4 */}
                {quarter === 4 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <label className="text-sm font-medium text-blue-900 flex-1">
                            5. ความสำเร็จในการลดความเสี่ยง (20)
                        </label>
                        <input 
                            type="number" 
                            min="0" max="20"
                            value={scores[5] || ''}
                            onChange={(e) => handleScoreChange(5, e.target.value)}
                            className="w-full sm:w-24 px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                )}

                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">สรุปผลและข้อเสนอแนะ</label>
                    <textarea 
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="กรอกความคิดเห็น..."
                    ></textarea>
                </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ยกเลิก
                </button>
                <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    {isSaving ? 'กำลังบันทึก...' : <><Save className="w-4 h-4" /> บันทึก</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

function getLabel(id: number) {
    switch(id) {
        case 1: return 'การใช้แบบฟอร์มการประเมิน';
        case 2: return 'ความครอบคลุม';
        case 3: return 'ความชัดเจนของเป้าหมาย';
        case 4: return 'การให้ความร่วมมือ';
        default: return '';
    }
}