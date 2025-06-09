import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, User, Bot } from 'lucide-react';

const Chatbot = ({ resumeData }) => {
    const [step, setStep] = useState('welcome');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [tempData, setTempData] = useState({});
    const chatEndRef = useRef(null);
    
    // This ref will prevent the initial message from sending twice
    const initialMessageSent = useRef(false);

    useEffect(() => {
        if (!initialMessageSent.current) {
            addMessage("Hello! I'm Resume Bot. Let's create a professional resume. What's your full name?", 'bot');
            initialMessageSent.current = true;
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);
    
    const saveToFirestore = async (data) => {
        if (auth.currentUser) {
            const resumeRef = doc(db, 'resumes', auth.currentUser.uid);
            await setDoc(resumeRef, data, { merge: true });
        }
    }

    const nextStep = (nextStepName) => {
        setStep(nextStepName);
        const questions = {
            'personal_email': "What's your email address?",
            'personal_phone': "Great. What's your phone number?",
            'personal_linkedin': "Your LinkedIn profile URL? (optional, press enter to skip)",
            'summary_start': "Let's add a professional summary. Briefly describe your background and career goals.",
            'experience_start': "Now for work experience. What was your most recent job title?",
            'experience_company': "Which company was this at?",
            'experience_location': "Where was it located? (e.g., City, State)",
            'experience_dates': "When did you work there? (e.g., Jan 2020 - Present)",
            'experience_duties': "Describe key responsibilities. (Enter one per message, type 'done' when finished)",
            'experience_another': "Add another work experience? (yes/no)",
            'projects_start': "Let's highlight some projects. What's the name of a project you've worked on?",
            'projects_desc': "Briefly describe the project.",
            'projects_tech': "What technologies did you use? (e.g., React, Python)",
            'projects_another': "Add another project? (yes/no)",
            'education_start': "Next, education. What was your degree?",
            'education_school': "What was the name of the school or university?",
            'education_location': "Where was it located?",
            'education_date': "When did you graduate? (e.g., May 2019)",
            'education_another': "Add another educational qualification? (yes/no)",
            'certifications_start': "Any certifications? Enter one at a time, or type 'done' to skip.",
            'certifications_another': "Add another certification? (or type 'done')",
            'skills_start': "Let's list your skills. Enter one skill at a time. (Type 'done' when finished)",
            'languages_start': "Finally, what languages do you speak? Enter one at a time, or type 'done' to finish.",
            'final': "Your resume is complete! Choose a style and download it from the preview panel."
        };
        if (questions[nextStepName]) {
            addMessage(questions[nextStepName]);
        }
    };

    const addMessage = (text, sender = 'bot') => {
        setMessages(prev => [...prev, { text, sender, id: Math.random() }]);
    };
    
    const handleUserInput = async () => {
        const input = inputValue.trim();
        if (!input && !['personal_linkedin', 'certifications_start'].includes(step)) return;

        addMessage(input, 'user');
        const currentResumeData = { ...resumeData };

        const updateAndSave = async (data) => {
            const updatedData = { ...currentResumeData, ...data };
            await saveToFirestore(updatedData);
        };

        switch (step) {
            case 'welcome': currentResumeData.personal.name = input; nextStep('personal_email'); break;
            case 'personal_email': currentResumeData.personal.email = input; nextStep('personal_phone'); break;
            case 'personal_phone': currentResumeData.personal.phone = input; nextStep('personal_linkedin'); break;
            case 'personal_linkedin': currentResumeData.personal.linkedin = input; await updateAndSave({ personal: currentResumeData.personal }); nextStep('summary_start'); break;
            case 'summary_start': await updateAndSave({ summary: input }); nextStep('experience_start'); break;
            case 'experience_start': setTempData({ jobTitle: input }); nextStep('experience_company'); break;
            case 'experience_company': setTempData(prev => ({ ...prev, company: input })); nextStep('experience_location'); break;
            case 'experience_location': setTempData(prev => ({ ...prev, location: input })); nextStep('experience_dates'); break;
            case 'experience_dates': setTempData(prev => ({ ...prev, dates: input, duties: [] })); nextStep('experience_duties'); break;
            case 'experience_duties':
                if (input.toLowerCase() === 'done') {
                    await updateAndSave({ experience: [...(currentResumeData.experience || []), tempData] });
                    setTempData({});
                    nextStep('experience_another');
                } else {
                    setTempData(prev => ({ ...prev, duties: [...(prev.duties || []), input] }));
                    addMessage("Added. Enter another duty, or type 'done'.");
                }
                break;
            case 'experience_another': input.toLowerCase() === 'yes' ? nextStep('experience_start') : nextStep('projects_start'); break;
            case 'projects_start': setTempData({ name: input }); nextStep('projects_desc'); break;
            case 'projects_desc': setTempData(prev => ({ ...prev, description: input })); nextStep('projects_tech'); break;
            case 'projects_tech':
                const newProject = { ...tempData, tech: input };
                await updateAndSave({ projects: [...(currentResumeData.projects || []), newProject] });
                setTempData({});
                nextStep('projects_another');
                break;
            case 'projects_another': input.toLowerCase() === 'yes' ? nextStep('projects_start') : nextStep('education_start'); break;
            case 'education_start': setTempData({ degree: input }); nextStep('education_school'); break;
            case 'education_school': setTempData(prev => ({ ...prev, school: input })); nextStep('education_location'); break;
            case 'education_location': setTempData(prev => ({ ...prev, location: input })); nextStep('education_date'); break;
            case 'education_date':
                const newEducation = { ...tempData, date: input };
                await updateAndSave({ education: [...(currentResumeData.education || []), newEducation] });
                setTempData({});
                nextStep('education_another');
                break;
            case 'education_another': input.toLowerCase() === 'yes' ? nextStep('education_start') : nextStep('certifications_start'); break;
            case 'certifications_start':
            case 'certifications_another':
                if (input.toLowerCase() === 'done' || (step === 'certifications_start' && !input)) {
                    nextStep('skills_start');
                } else {
                    await updateAndSave({ certifications: [...(currentResumeData.certifications || []), input] });
                    addMessage("Certification added. Enter another, or type 'done'.");
                    setStep('certifications_another');
                }
                break;
            case 'skills_start':
                if (input.toLowerCase() === 'done') {
                    nextStep('languages_start');
                } else {
                    await updateAndSave({ skills: [...(currentResumeData.skills || []), input] });
                    addMessage("Skill added. Enter another, or type 'done'.");
                }
                break;
            case 'languages_start':
                if (input.toLowerCase() === 'done') {
                    nextStep('final');
                } else {
                    await updateAndSave({ languages: [...(currentResumeData.languages || []), input] });
                    addMessage("Language added. Enter another, or type 'done'.");
                }
                break;
                default:
    console.warn(`Unhandled step: ${step}`);
    break;

        }
        setInputValue('');
    };
    
    return (
        <div className="lg:w-1/2 flex flex-col h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex-grow p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <Bot className="text-indigo-500 flex-shrink-0" />}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl break-words ${
                                msg.sender === 'user' 
                                ? 'bg-indigo-500 text-white rounded-br-none' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                            }`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                             {msg.sender === 'user' && <User className="text-gray-400 flex-shrink-0" />}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
                        placeholder={step !== 'final' ? "Type your answer..." : "Your resume is complete."}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={step === 'final'}
                    />
                    <button onClick={handleUserInput} disabled={(!inputValue.trim() && !['personal_linkedin', 'certifications_start'].includes(step)) || step === 'final'}
                        className="bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
