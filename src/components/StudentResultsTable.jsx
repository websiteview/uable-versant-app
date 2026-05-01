import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, BarChart } from 'lucide-react';

const StudentResultsTable = ({ students, selectedIds = [], onSelectionChange, onDelete, onViewDetails }) => {
  const { t } = useLanguage();

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
  
  const getScoreColor = (score) => {
    if (score < 40) return 'text-red-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-green-600';
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(students.map(s => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (studentId, checked) => {
    if (checked) {
      onSelectionChange([...selectedIds, studentId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== studentId));
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t("No student results yet. Students who complete the test will appear here.")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-indigo-50">
          <tr>
            <th className="px-3 py-3 w-12">
              <Checkbox 
                checked={students.length > 0 && selectedIds.length === students.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Student Name</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Overall</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">CEFR</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Proficiency %</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Pronunciation</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Grammar</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Vocabulary</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Comprehension</th>
            <th className="px-3 py-3 text-left font-semibold text-indigo-900">Completed</th>
            <th className="px-3 py-3 text-center font-semibold text-indigo-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(student.id) ? 'bg-indigo-50/50' : ''}`}>
              <td className="px-3 py-3">
                <Checkbox 
                  checked={selectedIds.includes(student.id)}
                  onCheckedChange={(checked) => handleSelectRow(student.id, checked)}
                  aria-label={`Select ${student.fullName}`}
                />
              </td>
              <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{student.fullName}</td>
              <td className="px-3 py-3 font-semibold text-indigo-900">{student.score.overallScore}</td>
              <td className="px-3 py-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProficiencyColor(student.score.cefrLevel)}`}>
                  {student.score.cefrLevel}
                </span>
              </td>
              <td className="px-3 py-3 font-medium text-gray-700">{student.score.proficiencyPercentage}%</td>
              <td className={`px-3 py-3 font-medium ${getScoreColor(student.score.subScores.pronunciation)}`}>{student.score.subScores.pronunciation}</td>
              <td className={`px-3 py-3 font-medium ${getScoreColor(student.score.subScores.grammar)}`}>{student.score.subScores.grammar}</td>
              <td className={`px-3 py-3 font-medium ${getScoreColor(student.score.subScores.vocabulary)}`}>{student.score.subScores.vocabulary}</td>
              <td className={`px-3 py-3 font-medium ${getScoreColor(student.score.subScores.comprehension)}`}>{student.score.subScores.comprehension}</td>
              <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                {new Date(student.submittedAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => onViewDetails(student)}
                  >
                    <BarChart className="h-4 w-4" />
                    <span className="sr-only">View Details</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(student.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentResultsTable;