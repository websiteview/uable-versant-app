import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link2, Download, LogOut, Users, FileText, Plus, Clock, Trash2, Lock, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getTestLinks, createTestLink, getStudentsByTeacher, deleteTestLink, 
  deleteExpiredLinks, deleteStudentResult, bulkDeleteStudentResults, changeTeacherPassword
} from '@/lib/storage';
import { exportToPdf, exportStudentDetailPdf } from '@/lib/pdf';
import { useLanguage } from '@/contexts/LanguageContext';
import TestLinkCard from '@/components/TestLinkCard';
import StudentResultsTable from '@/components/StudentResultsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const TeacherDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewingStudent, setViewingStudent] = useState(null); 
  
  const [activeTab, setActiveTab] = useState('results');

  const [testLinks, setTestLinks] = useState([]);
  const [students, setStudents] = useState([]);
  const [expiryHours, setExpiryHours] = useState(24);
  
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isConfirmPasswordChangeOpen, setIsConfirmPasswordChangeOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ type: null, id: null });
  const [selectedResultIds, setSelectedResultIds] = useState([]);

  const { logout, user, isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Security: Component mount validation to prevent cached dashboard view
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      console.warn("Security: No active session found on dashboard mount. Redirecting.");
      navigate('/teacher/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    if (user && isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 2000);
      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated]);

  const loadData = () => {
    if (user) {
      setTestLinks(getTestLinks(user.id));
      const studentData = getStudentsByTeacher(user.id).map(s => {
          if (typeof s.score === 'number') {
              return { ...s, score: { overallScore: s.score, cefrLevel: 'N/A', proficiencyPercentage: 0, subScores: { pronunciation: 0, grammar: 0, vocabulary: 0, comprehension: 0 } } }
          }
          return s;
      });
      setStudents(studentData);
    }
  };

  const handleViewStudentDetails = (student) => {
    setViewingStudent(student);
    setCurrentView('student-details');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setViewingStudent(null);
  };

  const handleCreateLink = () => {
    const hours = parseInt(expiryHours);
    if (isNaN(hours) || hours < 1) { toast({ title: "Invalid Time", description: "Enter valid hours.", variant: "destructive" }); return; }
    createTestLink(user.id, user.name, hours);
    loadData();
    setIsCreateLinkOpen(false);
    toast({ title: t("Test Link Created"), description: `${t("Link created successfully")}.` });
  };

  const handlePasswordChangeInit = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError("Passwords do not match."); return; }
    setIsConfirmPasswordChangeOpen(true);
  };

  const handleConfirmPasswordChange = () => {
    const result = changeTeacherPassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      toast({ title: "Success", description: "Password updated." });
      setIsConfirmPasswordChangeOpen(false); setIsChangePasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else { setIsConfirmPasswordChangeOpen(false); setPasswordError(result.message); }
  };

  const confirmDeleteLink = (id) => { setDeleteConfig({ type: 'link', id }); setDeleteDialogOpen(true); };
  const confirmDeleteResult = (id) => { setDeleteConfig({ type: 'result', id }); setDeleteDialogOpen(true); };
  const confirmBulkDeleteResults = () => { setDeleteConfig({ type: 'bulk-results' }); setDeleteDialogOpen(true); };
  const confirmDeleteExpiredLinks = () => { setDeleteConfig({ type: 'expired-links' }); setDeleteDialogOpen(true); };

  const handleConfirmDelete = () => {
    const { type, id } = deleteConfig;
    if (type === 'link') deleteTestLink(id);
    else if (type === 'result') { deleteStudentResult(id); setSelectedResultIds(prev => prev.filter(sid => sid !== id)); }
    else if (type === 'bulk-results') { 
        bulkDeleteStudentResults(selectedResultIds);
        setSelectedResultIds([]); 
    }
    else if (type === 'expired-links') deleteExpiredLinks(user.id);
    
    loadData();
    setDeleteDialogOpen(false);
    toast({ title: "Deleted", description: "Item(s) removed successfully." });
    if (currentView === 'student-details' && type === 'result' && id === viewingStudent?.id) {
        handleBackToDashboard();
    }
  };
  
  const handleExport = () => {
    const data = selectedResultIds.length > 0 ? students.filter(s => selectedResultIds.includes(s.id)) : students;
    if (data.length === 0) { toast({ title: "No Data", variant: "destructive" }); return; }
    exportToPdf(data, user.name);
    toast({ title: "Export Successful", description: `${data.length} records exported to PDF.` });
  };

  const handleLogout = () => { 
    logout(); // Uses enhanced global scope equivalent signout
    navigate('/teacher/login', { replace: true }); 
  };
  
  const handleCopyLink = (id) => { navigator.clipboard.writeText(`${window.location.origin}/test/${id}`); toast({ title: t("Link Copied") }); };

  const activeLinks = testLinks.filter(l => new Date(l.expiresAt) > new Date());
  const expiredLinksCount = testLinks.length - activeLinks.length;
  const uniqueStudents = new Set(students.map(s => s.email)).size;

  return (
    <>
      <Helmet><title>Teacher Dashboard - UAble</title></Helmet>

      <div className="min-h-screen pb-12">
        <nav className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex justify-between items-center h-16">
               <div className="flex items-center space-x-2">
                 {currentView === 'student-details' ? (
                   <Button variant="ghost" className="mr-2 pl-0 hover:bg-transparent group" onClick={handleBackToDashboard}>
                      <ArrowLeft className="h-6 w-6 text-indigo-600 mr-2 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-xl font-bold text-indigo-900">Back</span>
                   </Button>
                 ) : (
                    <>
                      <FileText className="h-8 w-8 text-indigo-600" />
                      <span className="text-xl font-bold text-indigo-900">Teacher Dashboard</span>
                    </>
                 )}
               </div>
               <div className="flex items-center space-x-4">
                 <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                    <DialogTrigger asChild><Button variant="outline" size="sm" className="hidden sm:flex"><Lock className="h-4 w-4 mr-2" />Security</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader><form onSubmit={handlePasswordChangeInit} className="space-y-4"><Input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} /><Input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} /><Input type="password" placeholder="Confirm" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} /><Button type="submit" className="w-full">Update</Button></form></DialogContent>
                 </Dialog>
                 <span className="text-sm text-gray-600 hidden sm:inline">{user?.name}</span>
                 <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
               </div>
             </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
             {currentView === 'dashboard' ? (
                <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  
                   <div className="grid md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-white p-6 rounded-xl shadow border"><div className="flex items-center space-x-3 mb-2"><Link2 className="h-8 w-8 text-indigo-600" /><h3 className="text-lg font-semibold">Active Test Links</h3></div><p className="text-3xl font-bold text-indigo-900">{activeLinks.length}</p></div>
                     <div className="bg-white p-6 rounded-xl shadow border"><div className="flex items-center space-x-3 mb-2"><Users className="h-8 w-8 text-green-600" /><h3 className="text-lg font-semibold">Unique Students</h3></div><p className="text-3xl font-bold text-green-900">{uniqueStudents}</p></div>
                     <div className="bg-white p-6 rounded-xl shadow border"><div className="flex items-center space-x-3 mb-2"><FileText className="h-8 w-8 text-blue-600" /><h3 className="text-lg font-semibold">Total Submissions</h3></div><p className="text-3xl font-bold text-blue-900">{students.length}</p></div>
                   </div>

                   <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList><TabsTrigger value="results">{t("Student Results")}</TabsTrigger><TabsTrigger value="links">{t("Test Links")}</TabsTrigger></TabsList>
                      
                      <TabsContent value="results">
                         <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                               <h2 className="text-2xl font-bold text-indigo-900">{t("Student Results")}</h2>
                               <div className="flex gap-2">
                                  {selectedResultIds.length > 0 && <Button variant="destructive" onClick={confirmBulkDeleteResults}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>}
                                  <Button onClick={handleExport} variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
                               </div>
                            </div>
                            <StudentResultsTable students={students} selectedIds={selectedResultIds} onSelectionChange={setSelectedResultIds} onDelete={confirmDeleteResult} onViewDetails={handleViewStudentDetails} />
                         </div>
                      </TabsContent>

                      <TabsContent value="links">
                         <div className="bg-white rounded-xl shadow p-6">
                            <div className="flex justify-between items-center mb-6">
                               <h2 className="text-2xl font-bold text-indigo-900">Active Test Links</h2>
                               <div className="flex gap-2">
                                 {expiredLinksCount > 0 && <Button variant="destructive" onClick={confirmDeleteExpiredLinks}><Trash2 className="h-4 w-4 mr-2" />Clear Expired</Button>}
                                 <Dialog open={isCreateLinkOpen} onOpenChange={setIsCreateLinkOpen}>
                                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />{t("Create Link")}</Button></DialogTrigger>
                                    <DialogContent><DialogHeader><DialogTitle>Create Test Link</DialogTitle></DialogHeader><div className="space-y-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4" /><Input type="number" min="1" value={expiryHours} onChange={e => setExpiryHours(e.target.value)} /></div><Button onClick={handleCreateLink} className="w-full">Generate</Button></div></DialogContent>
                                 </Dialog>
                               </div>
                            </div>
                            <div className="grid gap-4">
                               {activeLinks.length === 0 ? <div className="text-center py-8 text-gray-500">{t("No active links.")}</div> : activeLinks.map(link => <TestLinkCard key={link.id} link={link} onCopy={handleCopyLink} onDelete={confirmDeleteLink} />)}
                            </div>
                         </div>
                      </TabsContent>
                   </Tabs>
                </motion.div>
             ) : (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                   <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto border border-indigo-50">
                       <div className="flex items-center justify-between mb-8 pb-4 border-b">
                          <h2 className="text-3xl font-bold text-indigo-900">{viewingStudent?.fullName}</h2>
                          <span className={`px-4 py-2 rounded-full text-xl font-bold ${viewingStudent?.score.cefrLevel === 'C2' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{viewingStudent?.score.cefrLevel}</span>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6 mb-8">
                           <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Overall Score</p><p className="text-4xl font-bold text-indigo-600">{viewingStudent?.score.overallScore}</p></div>
                           <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Test Version</p><p className="text-xl font-medium text-gray-800">Ver {viewingStudent?.version}</p></div>
                       </div>

                       <div className="space-y-6 mb-8">
                          <h3 className="text-lg font-semibold text-gray-800">Skill Breakdown</h3>
                          {Object.entries(viewingStudent?.score.subScores || {}).map(([key, val]) => (
                             <div key={key}>
                                <div className="flex justify-between mb-1"><span className="capitalize font-medium text-gray-700">{key}</span><span className="font-bold">{val}/100</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${val}%` }}></div></div>
                             </div>
                          ))}
                       </div>
                       
                       {viewingStudent?.score.breakdown && (
                          <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Analysis</h3>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Section</th>
                                    <th className="px-4 py-2 text-center text-green-600">Correct</th>
                                    <th className="px-4 py-2 text-center text-red-600">Incorrect</th>
                                    <th className="px-4 py-2 text-center text-orange-500">Unanswered</th>
                                    <th className="px-4 py-2 text-center">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {Object.entries(viewingStudent.score.breakdown).map(([section, stats]) => (
                                    <tr key={section}>
                                      <td className="px-4 py-2 font-medium text-gray-700">{section}</td>
                                      <td className="px-4 py-2 text-center font-bold text-green-600 flex justify-center items-center gap-1"><CheckCircle className="w-3 h-3" /> {stats.correct}</td>
                                      <td className="px-4 py-2 text-center font-bold text-red-500 flex justify-center items-center gap-1"><XCircle className="w-3 h-3" /> {stats.incorrect}</td>
                                      <td className="px-4 py-2 text-center font-bold text-orange-500 flex justify-center items-center gap-1"><AlertCircle className="w-3 h-3" /> {stats.unanswered}</td>
                                      <td className="px-4 py-2 text-center text-gray-500">{stats.total}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">* Unanswered items receive 0 points and negatively impact the final score.</p>
                          </div>
                       )}

                       <div className="mt-8 flex justify-end gap-4">
                          <Button variant="outline" onClick={() => exportStudentDetailPdf(viewingStudent)}>
                             <Download className="h-4 w-4 mr-2" /> Download Report (PDF)
                          </Button>
                          <Button onClick={handleBackToDashboard}>Return to Dashboard</Button>
                       </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </div>

        <AlertDialog open={isConfirmPasswordChangeOpen} onOpenChange={setIsConfirmPasswordChangeOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmPasswordChange}>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Item?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </div>
    </>
  );
};

export default TeacherDashboard;