import React, { useState } from 'react';
import { generatePDF } from './pdfGenerator';
import {
    User, Briefcase, GraduationCap, BrainCircuit, Download, FileText, Loader2,
    Award, Wrench, Languages, Palette
} from 'lucide-react';


// **CHANGE 2: REFACTORED COMPONENTS**
// Moved TemplateControls outside the main component. 
// It now receives all its data as props, making it a pure, predictable component.
const TemplateControls = ({ template, setTemplate, modernColor, setModernColor }) => {
    const colors = ['#2563EB', '#DB2777', '#059669', '#581C87', '#D97706'];
    return (
        <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-center gap-4">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Palette size={18} /> Style:</h3>
                <button onClick={() => setTemplate('modern')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${template === 'modern' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-600'}`}>Modern</button>
                <button onClick={() => setTemplate('classic')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${template === 'classic' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-600'}`}>Classic</button>
            </div>
            {template === 'modern' && (
                 <div className="flex items-center justify-center gap-3 mt-3">
                     <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Color:</h4>
                     {colors.map(color => (
                         <button key={color} onClick={() => setModernColor(color)} style={{backgroundColor: color}} className={`w-6 h-6 rounded-full border border-gray-400 transition-transform transform hover:scale-110 ${modernColor === color ? 'ring-2 ring-offset-2 dark:ring-offset-gray-700 ring-black dark:ring-white' : ''}`} />
                     ))}
                 </div>
            )}
        </div>
    );
};

// Moved Section component outside and ensured it properly receives props.
const Section = ({ icon, title, items, children, template, modernColor, className = "" }) => {
    if (!items || items.length === 0) return null;
    
    let titleStyle = {};
    if (template === 'modern') {
        titleStyle = { color: modernColor, borderBottom: `2px solid ${modernColor}` };
    } else if (template === 'classic') {
        titleStyle = { color: 'black', borderBottom: '1px solid black' };
    }

    return (
        <div className={`mb-6 ${className}`}>
            <h2 className="text-xl font-bold pb-2 mb-3 flex items-center gap-2" style={titleStyle}>
                {icon} {title}
            </h2>
            {children}
        </div>
    );
};

// Moved PreviewContent outside. It now receives all necessary data via props.
const PreviewContent = ({ resumeData, template, modernColor }) => {
    let containerClass = template === 'classic' ? 'font-serif text-black' : 'font-sans text-gray-800 dark:text-gray-200';
    
    return (
        <div className={containerClass}>
            <div className="text-center pb-4 mb-6" style={template === 'classic' ? {borderBottom: '2px solid black'} : {}}>
                <h1 className="font-bold" style={{fontSize: '2.25rem', color: template === 'modern' ? modernColor : 'inherit' }}>{resumeData.personal?.name || "Your Name"}</h1>
                <p className="text-md mt-2">{[resumeData.personal?.email, resumeData.personal?.phone, resumeData.personal?.linkedin].filter(Boolean).join(' | ')}</p>
            </div>
            {resumeData.summary && <Section template={template} modernColor={modernColor} icon={<User size={20}/>} title="Summary" items={[resumeData.summary]}><p className="text-sm">{resumeData.summary}</p></Section>}
            <Section template={template} modernColor={modernColor} icon={<Briefcase size={20}/>} title="Experience" items={resumeData.experience}>
                {resumeData.experience.map((job, index) => (<div key={index} className="mb-4 break-inside-avoid"><div className="flex justify-between items-baseline"><h3 className="text-lg font-semibold">{job.jobTitle}</h3><p className="text-sm font-light">{job.dates}</p></div><div className="flex justify-between items-baseline"><p className="text-md font-medium">{job.company}</p><p className="text-sm font-light">{job.location}</p></div><ul className="list-disc list-inside mt-2 text-sm space-y-1">{job.duties?.map((duty, i) => <li key={i}>{duty}</li>)}</ul></div>))}
            </Section>
             <Section template={template} modernColor={modernColor} icon={<Wrench size={20}/>} title="Projects" items={resumeData.projects}>
                {resumeData.projects.map((proj, i) => <div key={i} className="mb-4 break-inside-avoid"><h3 className="text-lg font-semibold">{proj.name}</h3><p className="text-sm italic">{proj.tech}</p><p className="text-sm mt-1">{proj.description}</p></div>)}
             </Section>
            <Section template={template} modernColor={modernColor} icon={<GraduationCap size={20}/>} title="Education" items={resumeData.education}>
                {resumeData.education.map((edu, i) => <div key={i} className="mb-3"><div className="flex justify-between items-baseline"><h3 className="text-lg font-semibold">{edu.degree}</h3><p className="text-sm font-light">{edu.date}</p></div><div className="flex justify-between items-baseline"><p className="text-md font-medium">{edu.school}</p><p className="text-sm font-light">{edu.location}</p></div></div>)}
            </Section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <Section template={template} modernColor={modernColor} icon={<BrainCircuit size={20}/>} title="Skills" items={resumeData.skills}><div className="flex flex-wrap gap-2">{resumeData.skills.map((s, i) => <span key={i} className="bg-gray-200 dark:bg-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">{s}</span>)}</div></Section>
                <Section template={template} modernColor={modernColor} icon={<Award size={20}/>} title="Certifications" items={resumeData.certifications}><ul className="list-disc list-inside text-sm space-y-1">{resumeData.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul></Section>
                <Section template={template} modernColor={modernColor} icon={<Languages size={20}/>} title="Languages" items={resumeData.languages}><ul className="list-disc list-inside text-sm space-y-1">{resumeData.languages.map((l, i) => <li key={i}>{l}</li>)}</ul></Section>
            </div>
        </div>
    )
};

// This is the main component export. It is now much cleaner.
const ResumePreview = ({ resumeData, template, setTemplate, modernColor, setModernColor }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    
    const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script'); script.src = src;
        script.onload = () => resolve(); script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.head.appendChild(script);
    });

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            generatePDF(template, resumeData, modernColor);
        } catch (error) {
            console.error("PDF Download failed:", error);
            alert("Sorry, there was an error creating the PDF.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    const hasData = Object.values(resumeData).some(val => val && (Array.isArray(val) ? val.length > 0 : typeof val === 'object' ? Object.keys(val).length > 0 : typeof val === 'string' && val.length > 0));
    
    return (
        <div className="lg:w-1/2 flex flex-col h-[80vh]">
            <TemplateControls 
                template={template} 
                setTemplate={setTemplate} 
                modernColor={modernColor} 
                setModernColor={setModernColor} 
            />
            <div id="resume-preview" className="flex-grow p-8 overflow-y-auto rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {hasData ? (
                    <PreviewContent 
                        resumeData={resumeData} 
                        template={template} 
                        modernColor={modernColor} 
                    />
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-center">
                         <FileText size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                         <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Resume Preview</h3>
                         <p className="text-gray-500 dark:text-gray-400 mt-2">Your resume will appear here as you build it.</p>
                     </div>
                )}
            </div>
            <div className="mt-4 text-center">
                 <button onClick={handleDownload} disabled={isDownloading || !hasData} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-indigo-300 dark:disabled:bg-gray-600">
                     {isDownloading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                     {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
                 </button>
            </div>
        </div>
    );
};

export default ResumePreview;