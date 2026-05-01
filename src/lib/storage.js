const STORAGE_KEYS = {
  ADMINS: 'checkmate_admins',
  TEACHERS: 'checkmate_teachers',
  TEST_LINKS: 'checkmate_test_links',
  STUDENTS: 'checkmate_students',
  TEST_SESSIONS: 'checkmate_test_sessions', 
  EVALUATION_LOGS: 'checkmate_evaluation_logs'
};

const initializeStorage = () => {
  let admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || 'null');
  
  if (!admins) {
    admins = [{
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString()
    }];
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  }

  // Task 1: Ensure Eduardo exists
  if (!admins.some(a => a.username === 'Eduardo')) {
    admins.push({
       id: `admin-eduardo-${Date.now()}`,
       username: 'Eduardo',
       password: 'Eduardo123',
       role: 'admin',
       createdAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.TEST_LINKS)) localStorage.setItem(STORAGE_KEYS.TEST_LINKS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.TEST_SESSIONS)) localStorage.setItem(STORAGE_KEYS.TEST_SESSIONS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.EVALUATION_LOGS)) localStorage.setItem(STORAGE_KEYS.EVALUATION_LOGS, JSON.stringify([]));
};

initializeStorage();

// --- Admin & Auth ---
export const validateAdmin = (username, password) => {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
  const admin = admins.find(a => a.username === username && a.password === password);
  return admin || null;
};

export const getAdmins = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');

export const addAdmin = (adminData) => {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
  if (admins.some(a => a.username === adminData.username)) return { success: false, message: 'Username already exists.' };
  const newAdmin = { id: `admin-${Date.now()}`, username: adminData.username, password: adminData.password, role: 'admin', createdAt: new Date().toISOString() };
  admins.push(newAdmin);
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  return { success: true, message: 'Admin created successfully.' };
};

export const deleteAdmin = (adminId) => {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
  if (admins.length <= 1) return { success: false, message: 'Cannot delete the last administrator account.' };
  const filtered = admins.filter(a => a.id !== adminId);
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(filtered));
  return { success: true, message: 'Administrator deleted successfully.' };
};

export const changeAdminPassword = (adminId, currentPassword, newPassword) => {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
  const adminIndex = admins.findIndex(a => a.id === adminId);
  if (adminIndex === -1) return { success: false, message: 'Admin account not found.' };
  if (admins[adminIndex].password !== currentPassword) return { success: false, message: 'Current password is incorrect.' };
  admins[adminIndex].password = newPassword;
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  return { success: true, message: 'Password updated successfully.' };
};

export const changeAdminUsername = (adminId, password, newUsername) => {
  const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
  const adminIndex = admins.findIndex(a => a.id === adminId);
  if (adminIndex === -1) return { success: false, message: 'Admin account not found.' };
  if (admins[adminIndex].password !== password) return { success: false, message: 'Incorrect password.' };
  
  if (admins.some(a => a.username === newUsername && a.id !== adminId)) {
    return { success: false, message: 'Username already exists.' };
  }

  admins[adminIndex].username = newUsername;
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  return { success: true, message: 'Username updated successfully.' };
};

// --- Teacher Management ---
export const validateTeacher = (username, password) => {
  const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  const teacher = teachers.find(t => t.username === username && t.password === password);
  if (teacher) return { ...teacher, role: 'teacher' };
  return null;
};

export const changeTeacherPassword = (teacherId, currentPassword, newPassword) => {
  const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  const index = teachers.findIndex(t => t.id === teacherId);
  if (index === -1) return { success: false, message: 'Teacher account not found.' };
  if (teachers[index].password !== currentPassword) return { success: false, message: 'Current password is incorrect.' };
  teachers[index].password = newPassword;
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  return { success: true, message: 'Password updated successfully.' };
};

export const getTeachers = () => {
  const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  return teachers.map(teacher => ({ ...teacher, studentCount: students.filter(s => s.teacherId === teacher.id).length }));
};

export const addTeacher = (teacherData) => {
  const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  const newTeacher = { ...teacherData, id: `teacher-${Date.now()}`, createdAt: new Date().toISOString() };
  teachers.push(newTeacher);
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  return newTeacher;
};

export const deleteTeacher = (teacherId) => {
  const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  const filtered = teachers.filter(t => t.id !== teacherId);
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(filtered));
};

// --- Test Link Management (Version Selection) ---
export const createTestLink = (teacherId, teacherName, expiresInHours = 24) => {
  const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_LINKS) || '[]');
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + expiresInHours * 60 * 60 * 1000);
  
  const version = Math.floor(Math.random() * 10) + 1;
  
  const newLink = {
    id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    teacherId,
    teacherName,
    version: version,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    active: true,
  };
  links.push(newLink);
  localStorage.setItem(STORAGE_KEYS.TEST_LINKS, JSON.stringify(links));
  return newLink;
};

export const getTestLinks = (teacherId) => {
  const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_LINKS) || '[]');
  return links.filter(link => link.teacherId === teacherId);
};

export const getAllTestLinks = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_LINKS) || '[]');

export const validateTestLink = (linkId) => {
  const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_LINKS) || '[]');
  const link = links.find(l => l.id === linkId && l.active);
  if (!link) return null;
  if (new Date(link.expiresAt) < new Date()) return null; 
  return link;
};

export const deleteTestLink = (linkId) => {
  const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_LINKS) || '[]');
  const filtered = links.filter(link => link.id !== linkId);
  localStorage.setItem(STORAGE_KEYS.TEST_LINKS, JSON.stringify(filtered));
};

export const deleteExpiredLinks = (teacherId) => {
  const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_LINKS) || '[]');
  const now = new Date();
  const filtered = links.filter(link => link.teacherId !== teacherId || new Date(link.expiresAt) > now);
  localStorage.setItem(STORAGE_KEYS.TEST_LINKS, JSON.stringify(filtered));
};

// --- Student & Session Management ---
export const startTestSession = (studentId, linkId, version) => {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_SESSIONS) || '[]');
    const newSession = {
        sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId, linkId, version, startTime: new Date().toISOString(), status: 'started'
    };
    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.TEST_SESSIONS, JSON.stringify(sessions));
    return newSession;
};

export const saveTestResult = (studentData) => {
  // Task 6: Optimize mobile storage - ensure safe structure without large blobs
  let safeStudentData = { ...studentData };
  if (safeStudentData.answers) {
    const cleanedAnswers = {};
    for (const [key, value] of Object.entries(safeStudentData.answers)) {
      const { blob, audioUrl, ...safeData } = value;
      cleanedAnswers[key] = safeData;
    }
    safeStudentData.answers = cleanedAnswers;
  }

  const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_SESSIONS) || '[]');
  
  const session = sessions.find(s => s.studentId === safeStudentData.id) || {};
  
  const newStudent = {
    ...safeStudentData,
    id: safeStudentData.id || `student-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    startedAt: session.startTime || new Date().toISOString(),
    linkId: session.linkId || null 
  };
  
  students.push(newStudent);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

  if (safeStudentData.score && safeStudentData.score.subScores) {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVALUATION_LOGS) || '[]');
      const logEntry = {
          studentId: newStudent.id,
          version: safeStudentData.version,
          timestamp: new Date().toISOString(),
          ...safeStudentData.score.subScores,
          overallScore: safeStudentData.score.overallScore,
          cefrLevel: safeStudentData.score.cefrLevel
      };
      logs.push(logEntry);
      localStorage.setItem(STORAGE_KEYS.EVALUATION_LOGS, JSON.stringify(logs));
  }
  return newStudent;
};

export const getStudentsByTeacher = (teacherId) => {
  const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  return students.filter(student => student.teacherId === teacherId);
};

export const getAllStudents = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');

export const deleteStudentResult = (studentId) => {
  const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  const filtered = students.filter(s => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
  
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVALUATION_LOGS) || '[]');
  const filteredLogs = logs.filter(l => l.studentId !== studentId);
  localStorage.setItem(STORAGE_KEYS.EVALUATION_LOGS, JSON.stringify(filteredLogs));
};

export const bulkDeleteStudentResults = (studentIds) => {
  const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  const filtered = students.filter(s => !studentIds.includes(s.id));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
  
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVALUATION_LOGS) || '[]');
  const filteredLogs = logs.filter(l => !studentIds.includes(l.studentId));
  localStorage.setItem(STORAGE_KEYS.EVALUATION_LOGS, JSON.stringify(filteredLogs));
};