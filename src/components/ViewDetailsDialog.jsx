import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BarChart, User, Mail, Calendar, CheckCircle } from 'lucide-react';

const ViewDetailsDialog = ({ isOpen, onOpenChange, student }) => {
  if (!student) return null;

  const { score, fullName, email, submittedAt } = student;
  const {
    overallScore,
    cefrLevel,
    proficiencyPercentage,
    subScores,
  } = score;

  const getProficiencyColor = (level) => {
    const colors = {
      'A1': 'bg-red-100 text-red-800',
      'A2': 'bg-orange-100 text-orange-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-blue-100 text-blue-800',
      'C1': 'bg-indigo-100 text-indigo-800',
      'C2': 'bg-purple-100 text-purple-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };
  
  const ScoreBar = ({ label, value }) => {
    const getBarColor = (val) => {
      if (val < 40) return 'bg-red-400';
      if (val < 70) return 'bg-yellow-400';
      return 'bg-green-400';
    };
    
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-bold ${getBarColor(value).replace('bg','text').replace('-400', '-600')}`}>{value} / 100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getBarColor(value)}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-indigo-600" />
            Audio Evaluation Details
          </DialogTitle>
          <DialogDescription>
            Detailed proficiency analysis for {fullName}.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-800">{fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{email}</span>
            </div>
             <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Completed on: {new Date(submittedAt).toLocaleDateString()}</span>
            </div>
             <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Test Version: {student.version || 'N/A'}</span>
            </div>
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700">Overall Score</p>
              <p className="text-3xl font-bold text-indigo-900">{overallScore}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-700 text-right">CEFR Level</p>
               <span className={`px-4 py-1.5 rounded-full text-lg font-semibold ${getProficiencyColor(cefrLevel)}`}>
                  {cefrLevel}
                </span>
            </div>
          </div>
          
          <div className="space-y-4">
             <ScoreBar label="Pronunciation & Fluency" value={subScores.pronunciation} />
             <ScoreBar label="Grammatical Accuracy" value={subScores.grammar} />
             <ScoreBar label="Vocabulary Range" value={subScores.vocabulary} />
             <ScoreBar label="Listening Comprehension" value={subScores.comprehension} />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsDialog;