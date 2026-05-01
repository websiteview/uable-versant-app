import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, Plus, Trash2, LogOut, Shield, Lock, UserPlus, 
  UserCog, ChevronRight, ArrowLeft, Link as LinkIcon, BarChart, Inbox
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { 
  getTeachers, addTeacher, deleteTeacher, 
  addAdmin, getAdmins, deleteAdmin, getAllTestLinks, getAllStudents 
} from '@/lib/storage';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { ChangeUsernameDialog } from '@/components/ChangeUsernameDialog';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', username: '', password: '' });
  
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [adminToChangePassword, setAdminToChangePassword] = useState(null);
  const [adminToChangeUsername, setAdminToChangeUsername] = useState(null);

  const [createAdminForm, setCreateAdminForm] = useState({
    newUsername: '', newPassword: '', masterUsername: '', masterPassword: ''
  });

  const { logout, user, isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Security: Component mount validation to prevent cached dashboard view
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      console.warn("Security: No active session found on dashboard mount. Redirecting.");
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); 
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const allLinks = getAllTestLinks();
    const allStudents = getAllStudents();
    
    const richTeachers = getTeachers().map(t => {
      const teacherLinks = allLinks.filter(l => l.teacherId === t.id);
      const activeLinks = teacherLinks.filter(l => new Date(l.expiresAt) > new Date());
      const expiredLinks = teacherLinks.filter(l => new Date(l.expiresAt) <= new Date());
      
      const linksWithCounts = teacherLinks.map(link => ({
        ...link,
        studentCount: allStudents.filter(s => s.linkId === link.id).length
      }));

      // In a real Supabase setup, submissions might differ from unique students.
      // Using studentCount as a local placeholder for submissions.
      const totalSubmissions = allStudents.filter(s => s.teacherId === t.id).length;

      return {
        ...t,
        totalLinks: teacherLinks.length,
        activeLinksCount: activeLinks.length,
        expiredLinksCount: expiredLinks.length,
        submissionsCount: totalSubmissions,
        links: linksWithCounts
      };
    });

    setTeachers(richTeachers);
    
    // Simulate loading state for admins if needed
    const fetchedAdmins = getAdmins();
    setAdmins(fetchedAdmins);
    setIsLoadingAdmins(false);

    if (selectedTeacher) {
      const updated = richTeachers.find(t => t.id === selectedTeacher.id);
      if (updated) setSelectedTeacher(updated);
    }
  };

  const handleViewTeacherDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setCurrentView('teacher-details');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTeacher(null);
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email || !newTeacher.username || !newTeacher.password) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    addTeacher(newTeacher);
    setNewTeacher({ name: '', email: '', username: '', password: '' });
    setIsAddTeacherOpen(false);
    loadData();
    toast({ title: "Teacher Added", description: `${newTeacher.name} has been added successfully` });
  };

  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      deleteTeacher(teacherId);
      loadData();
      if (selectedTeacher?.id === teacherId) handleBackToDashboard();
      toast({ title: "Teacher Deleted", description: "Teacher has been removed from the system" });
    }
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    const { newUsername, newPassword, masterUsername, masterPassword } = createAdminForm;
    
    if (!newUsername || !newPassword || !masterUsername || !masterPassword) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" }); 
      return;
    }

    const MASTER_USERNAME = import.meta.env.VITE_MASTER_USERNAME || "masterhub01";
    const MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD || "Mh01!9xZ#coreAdminSecure";

    const inputUsername = masterUsername?.trim() || "";
    const inputPassword = masterPassword?.trim() || "";

    if (inputUsername === MASTER_USERNAME && inputPassword === MASTER_PASSWORD) {
      const result = addAdmin({ username: newUsername, password: newPassword });
      if (result.success) {
        toast({ title: "Success", description: "New administrator account created." });
        setIsCreateAdminOpen(false);
        setCreateAdminForm({ newUsername: '', newPassword: '', masterUsername: '', masterPassword: '' });
        loadData();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Security Alert", description: "Invalid master authorization", variant: "destructive" });
    }
  };

  const handleExecuteDeleteAdmin = () => {
    if (!adminToDelete) return;
    const result = deleteAdmin(adminToDelete.id);
    if (result.success) {
      toast({ title: "Deleted", description: `Admin ${adminToDelete.username} removed.` });
      loadData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setAdminToDelete(null);
  };

  const handleLogout = () => { 
    logout(); 
    navigate('/admin/login', { replace: true }); 
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - UAble</title>
      </Helmet>

      <div className="min-h-screen pb-12">
        <nav className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                {currentView === 'teacher-details' ? (
                   <Button variant="ghost" className="mr-2 pl-0 hover:bg-transparent group" onClick={handleBackToDashboard}>
                      <ArrowLeft className="h-6 w-6 text-indigo-600 mr-2 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-xl font-bold text-indigo-900">Back</span>
                   </Button>
                ) : (
                   <>
                     <Shield className="h-8 w-8 text-indigo-600" />
                     <span className="text-xl font-bold text-indigo-900">Admin Dashboard</span>
                   </>
                )}
              </div>
              <div className="flex items-center space-x-4">
                 <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="hidden md:flex bg-indigo-50 text-indigo-700">
                       <UserPlus className="h-4 w-4 mr-2" /> New Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Administrator</DialogTitle>
                      <DialogDescription>Requires Master Authorization</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                      <div className="space-y-2 border-b pb-4">
                        <Input placeholder="New Username" value={createAdminForm.newUsername} onChange={e => setCreateAdminForm({...createAdminForm, newUsername: e.target.value})} />
                        <Input type="password" placeholder="New Password" value={createAdminForm.newPassword} onChange={e => setCreateAdminForm({...createAdminForm, newPassword: e.target.value})} />
                      </div>
                      <div className="p-3 bg-red-50 rounded border border-red-100 space-y-2">
                        <p className="text-xs font-bold text-red-800 uppercase">Master Credentials</p>
                        <Input placeholder="Master Username" value={createAdminForm.masterUsername} onChange={e => setCreateAdminForm({...createAdminForm, masterUsername: e.target.value})} className="border-red-200" />
                        <Input type="password" placeholder="Master Password" value={createAdminForm.masterPassword} onChange={e => setCreateAdminForm({...createAdminForm, masterPassword: e.target.value})} className="border-red-200" />
                      </div>
                      <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Open password dialog for the currently logged in user */}
                <Button variant="outline" size="sm" onClick={() => setAdminToChangePassword(user)}>
                  <Lock className="h-4 w-4 mr-2" /> Security
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <AnimatePresence mode="wait">
             {currentView === 'dashboard' ? (
                <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow border border-indigo-50">
                      <div className="flex items-center space-x-3 mb-2"><Users className="h-8 w-8 text-indigo-600" /><h3 className="text-lg font-semibold">Total Teachers</h3></div>
                      <p className="text-3xl font-bold text-indigo-900">{teachers.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-indigo-50">
                       <div className="flex items-center space-x-3 mb-2"><LinkIcon className="h-8 w-8 text-blue-600" /><h3 className="text-lg font-semibold">Total Active Links</h3></div>
                       <p className="text-3xl font-bold text-blue-900">{teachers.reduce((acc, t) => acc + t.activeLinksCount, 0)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-indigo-50">
                       <div className="flex items-center space-x-3 mb-2"><Shield className="h-8 w-8 text-gray-600" /><h3 className="text-lg font-semibold">Admins</h3></div>
                       <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-indigo-900">Teachers</h2>
                      <p className="text-gray-600">Manage teachers and view their link statistics</p>
                    </div>
                    <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
                      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Teacher</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add New Teacher</DialogTitle></DialogHeader>
                        <form onSubmit={handleAddTeacher} className="space-y-4">
                          <Input placeholder="Full Name" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} required />
                          <Input type="email" placeholder="Email" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} required />
                          <Input placeholder="Username" value={newTeacher.username} onChange={e => setNewTeacher({...newTeacher, username: e.target.value})} required />
                          <Input type="password" placeholder="Password" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} required />
                          <Button type="submit" className="w-full">Add Teacher</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="bg-white rounded-xl shadow overflow-hidden border border-indigo-50">
                    <table className="w-full">
                      <thead className="bg-indigo-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-900">Name</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-900">Active Links</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-900">Expired Links</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-900">Total Links</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-900">Submissions</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-900">Students</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {teachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{teacher.name}</div>
                              <div className="text-xs text-gray-500">{teacher.email}</div>
                            </td>
                            <td className="px-6 py-4 text-center"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{teacher.activeLinksCount}</span></td>
                            <td className="px-6 py-4 text-center"><span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{teacher.expiredLinksCount}</span></td>
                            <td className="px-6 py-4 text-center font-medium text-gray-900">{teacher.totalLinks}</td>
                            <td className="px-6 py-4 text-center font-medium text-purple-600 transition-all duration-300">
                              <div className="flex items-center justify-center gap-1">
                                <Inbox className="h-3 w-3" />
                                {teacher.submissionsCount || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-indigo-600">{teacher.studentCount}</td>
                            <td className="px-6 py-4 text-center">
                               <div className="flex justify-center gap-2">
                                 <Button variant="outline" size="sm" onClick={() => handleViewTeacherDetails(teacher)}>
                                   Details <ChevronRight className="h-4 w-4 ml-1" />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteTeacher(teacher.id)}>
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </div>
                            </td>
                          </tr>
                        ))}
                        {teachers.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No teachers found.</td></tr>}
                      </tbody>
                    </table>
                  </div>

                   <div className="mt-12">
                      <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2"><UserCog className="h-5 w-5" /> System Administrators</h2>
                      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                         <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {isLoadingAdmins ? (
                                <tr>
                                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">Loading administrators...</td>
                                </tr>
                              ) : (
                                admins.map(admin => (
                                  <tr key={admin.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                      {admin.username} {admin.id === user?.id && <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">(You)</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setAdminToChangePassword(admin)}>Change Password</Button>
                                        <Button variant="outline" size="sm" onClick={() => setAdminToChangeUsername(admin)}>Change Username</Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          disabled={admin.id === user?.id} 
                                          onClick={() => setAdminToDelete(admin)} 
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                         </table>
                      </div>
                   </div>

                </motion.div>
             ) : (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                   <div className="bg-white rounded-xl shadow-lg border border-indigo-50 p-6 mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
                        <div>
                          <h2 className="text-3xl font-bold text-indigo-900">{selectedTeacher?.name}</h2>
                          <p className="text-gray-600">{selectedTeacher?.email}</p>
                        </div>
                        <div className="flex gap-4 text-center">
                           <div className="bg-indigo-50 px-4 py-2 rounded-lg"><p className="text-xs text-indigo-600 font-bold uppercase">Total Students</p><p className="text-2xl font-bold text-indigo-900">{selectedTeacher?.studentCount}</p></div>
                           <div className="bg-blue-50 px-4 py-2 rounded-lg"><p className="text-xs text-blue-600 font-bold uppercase">Active Links</p><p className="text-2xl font-bold text-blue-900">{selectedTeacher?.activeLinksCount}</p></div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><LinkIcon className="h-5 w-5" /> Generated Test Links</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Version</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-indigo-600 uppercase">Submissions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                             {selectedTeacher?.links?.length === 0 ? (
                               <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No test links generated yet.</td></tr>
                             ) : (
                               selectedTeacher?.links?.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(link => {
                                 const isExpired = new Date(link.expiresAt) <= new Date();
                                 return (
                                   <tr key={link.id} className={isExpired ? 'bg-gray-50/50' : ''}>
                                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{link.id.split('-')[1]}...</td>
                                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(link.createdAt).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(link.expiresAt).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 text-center text-sm text-gray-600">{link.version}</td>
                                      <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                          {isExpired ? 'Expired' : 'Active'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <BarChart className="h-4 w-4 text-indigo-500" />
                                          <span className="font-bold text-indigo-900">{link.studentCount}</span>
                                        </div>
                                      </td>
                                   </tr>
                                 );
                               })
                             )}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        <ChangePasswordDialog 
          admin={adminToChangePassword} 
          isOpen={!!adminToChangePassword} 
          onOpenChange={(open) => !open && setAdminToChangePassword(null)} 
          onSuccess={loadData} 
        />
        
        <ChangeUsernameDialog 
          admin={adminToChangeUsername} 
          isOpen={!!adminToChangeUsername} 
          onOpenChange={(open) => !open && setAdminToChangeUsername(null)} 
          onSuccess={loadData} 
        />

        <AlertDialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>Delete Administrator?</AlertDialogTitle>
               <AlertDialogDescription>
                 Are you sure you want to permanently delete {adminToDelete?.username}? This action cannot be undone.
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction onClick={handleExecuteDeleteAdmin} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default AdminDashboard;