import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    "Welcome": "Welcome",
    "Logout": "Logout",
    "Teacher Dashboard": "Teacher Dashboard",
    "Test Links": "Test Links",
    "Total Students": "Total Students",
    "Completed Tests": "Completed Tests",
    "Create New Link": "Create New Link",
    "Test Link Created": "Test Link Created",
    "New test link has been generated successfully": "New test link has been generated successfully",
    "No Data": "No Data",
    "No student results to export yet": "No student results to export yet",
    "Export Successful": "Export Successful",
    "Excel file has been downloaded": "Excel file has been downloaded",
    "Student Results": "Student Results",
    "Export to Excel": "Export to Excel",
    "Created": "Created",
    "Active": "Active",
    "Copy Link": "Copy Link",
    "Link Copied": "Link Copied",
    "Test link copied to clipboard": "Test link copied to clipboard",
    "No test links created yet. Click 'Create New Link' to generate one.": "No test links created yet. Click 'Create New Link' to generate one.",
    "No student results yet. Students who complete the test will appear here.": "No student results yet. Students who complete the test will appear here.",
    "Please complete the registration form to begin": "Please complete the registration form to begin",
    "Start Test": "Start Test",
    "Next Question": "Next Question",
    "Submit Test": "Submit Test",
  },
  es: {
    "Welcome": "Bienvenido",
    "Logout": "Cerrar Sesión",
    "Teacher Dashboard": "Panel del Profesor",
    "Test Links": "Enlaces de Prueba",
    "Total Students": "Total de Estudiantes",
    "Completed Tests": "Pruebas Completadas",
    "Create New Link": "Crear Nuevo Enlace",
    "Test Link Created": "Enlace de Prueba Creado",
    "New test link has been generated successfully": "Se ha generado un nuevo enlace de prueba exitosamente",
    "No Data": "Sin Datos",
    "No student results to export yet": "Aún no hay resultados de estudiantes para exportar",
    "Export Successful": "Exportación Exitosa",
    "Excel file has been downloaded": "El archivo Excel se ha descargado",
    "Student Results": "Resultados de Estudiantes",
    "Export to Excel": "Exportar a Excel",
    "Created": "Creado",
    "Active": "Activo",
    "Copy Link": "Copiar Enlace",
    "Link Copied": "Enlace Copiado",
    "Test link copied to clipboard": "Enlace de prueba copiado al portapapeles",
    "No test links created yet. Click 'Create New Link' to generate one.": "Aún no se han creado enlaces de prueba. Haz clic en 'Crear Nuevo Enlace' para generar uno.",
    "No student results yet. Students who complete the test will appear here.": "Aún no hay resultados de estudiantes. Los estudiantes que completen la prueba aparecerán aquí.",
    "Please complete the registration form to begin": "Por favor complete el formulario de registro para comenzar",
    "Start Test": "Comenzar Prueba",
    "Next Question": "Siguiente Pregunta",
    "Submit Test": "Enviar Prueba",
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};