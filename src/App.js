import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
// Import 'setDoc' to be able to clear the data
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import Chatbot from './Chatbot';
import ResumePreview from './ResumePreview';
import { Bot, Sun, Moon, Loader2 } from 'lucide-react';

const initialResumeState = {
    personal: {}, summary: '', experience: [], projects: [],
    education: [], skills: [], certifications: [], languages: [],
};

export default function App() {
    const [theme, setTheme] = useState('light');
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [resumeData, setResumeData] = useState(initialResumeState);
    const [resumeTemplate, setResumeTemplate] = useState('modern');
    const [modernColor, setModernColor] = useState('#2563EB');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                // **CHANGE 1: RESET RESUME ON LOAD**
                // When the user is authenticated for a new session,
                // reset their document in Firestore to the initial state.
                const resumeRef = doc(db, 'resumes', user.uid);
                await setDoc(resumeRef, initialResumeState);
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Error signing in anonymously:", error);
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []); // This hook runs only once on initial mount.

    useEffect(() => {
        // This listener now reflects the (newly reset) data from Firestore
        // and will continue to update the preview in real-time as you use the chatbot.
        if (isAuthReady && auth.currentUser) {
            const resumeRef = doc(db, 'resumes', auth.currentUser.uid);
            const unsubscribe = onSnapshot(resumeRef, (doc) => {
                if (doc.exists()) {
                    setResumeData({ ...initialResumeState, ...doc.data() });
                } else {
                    setResumeData(initialResumeState);
                }
            });
            return () => unsubscribe();
        }
    }, [isAuthReady]); // The dependency on auth.currentUser is removed to avoid potential re-triggers.

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Loader2 className="animate-spin" />Loading Resume Bot...</div>
            </div>
        );
    }
    
    return (
        <div className={`min-h-screen font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500`}>
            <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <Bot size={32} className="text-indigo-500" />
                    <h1 className="text-2xl font-bold tracking-tight">Resume Bot</h1>
                </div>
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </header>
            <main className="flex flex-col lg:flex-row p-4 lg:p-8 gap-8">
                <Chatbot resumeData={resumeData} />
                <ResumePreview 
                    resumeData={resumeData} 
                    template={resumeTemplate} 
                    setTemplate={setResumeTemplate}
                    modernColor={modernColor}
                    setModernColor={setModernColor}
                />
            </main>
            <footer className="text-center p-4 mt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">User ID: {userId || 'Authenticating...'}</p>
            </footer>
        </div>
    );
}