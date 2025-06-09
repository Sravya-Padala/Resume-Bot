export const generatePDF = (template, resumeData, modernColor) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    const { personal, summary, experience, education, skills, projects, certifications, languages } = resumeData;
    const leftMargin = 40;
    const rightMargin = 555;
    const contentWidth = rightMargin - leftMargin;
    let y = 0;

    const renderModern = () => {
        const primaryColor = modernColor; const secondaryColor = '#4B5563';
        doc.setFillColor(primaryColor); doc.rect(0, 0, doc.internal.pageSize.getWidth(), 90, 'F');
        doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(28); y = 50;
        doc.text(personal.name || 'Your Name', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 20; doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        doc.text([personal.email, personal.phone, personal.linkedin].filter(Boolean).join('  |  '), doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y = 110;
        
        const addSection = (title, items, itemRenderer) => {
            if (!items || (Array.isArray(items) && items.length === 0) || (typeof items === 'string' && !items)) return;
            doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(primaryColor);
            doc.text(title.toUpperCase(), leftMargin, y);
            doc.setDrawColor(primaryColor); y += 5; doc.line(leftMargin, y, rightMargin, y); y += 20;
            doc.setTextColor(secondaryColor); itemRenderer(items); y += 10;
        };
        addSection('Summary', summary ? [summary] : [], (items) => { doc.setFontSize(10); doc.setFont('helvetica', 'normal'); const text = doc.splitTextToSize(items[0], contentWidth); doc.text(text, leftMargin, y); y += text.length * 12 + 10; });
        addSection('Experience', experience, (jobs) => jobs.forEach(job => {
            doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(job.jobTitle, leftMargin, y);
            doc.setFont('helvetica', 'normal'); doc.text(job.dates, rightMargin, y, { align: 'right' }); y += 14;
            doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.text(`${job.company} | ${job.location}`, leftMargin, y); y += 16;
            doc.setFont('helvetica', 'normal');
            (job.duties || []).forEach(duty => { const splitDuty = doc.splitTextToSize(`• ${duty}`, contentWidth - 10); doc.text(splitDuty, leftMargin + 10, y); y += splitDuty.length * 12; });
            y += 10;
        }));
        addSection('Projects', projects, (projs) => projs.forEach(proj => { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(proj.name, leftMargin, y); y += 14; doc.setFont('helvetica', 'normal'); doc.setFontSize(10); const d = doc.splitTextToSize(proj.description, contentWidth); doc.text(d, leftMargin, y); y += d.length * 12 + 4; doc.setFont('helvetica', 'italic'); doc.text(`Technologies: ${proj.tech}`, leftMargin, y); y += 20; }));
        addSection('Education', education, (edus) => edus.forEach(edu => { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(edu.degree, leftMargin, y); doc.setFont('helvetica', 'normal'); doc.text(edu.date, rightMargin, y, { align: 'right' }); y += 14; doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.text(`${edu.school} | ${edu.location}`, leftMargin, y); y += 20; }));
        const addCompactSection = (title, items) => { if(!items || items.length === 0) return; addSection(title, items, (data) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(10); const text = doc.splitTextToSize(data.join('  •  '), contentWidth); doc.text(text, leftMargin, y); y += text.length * 12; });};
        addCompactSection('Skills', skills); addCompactSection('Certifications', certifications); addCompactSection('Languages', languages);
    };

    const renderClassic = () => {
        const primaryColor = '#000000'; const secondaryColor = '#444444'; y = 40;
        doc.setFont('times', 'bold'); doc.setFontSize(24); doc.setTextColor(primaryColor);
        doc.text(personal.name || 'Your Name', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 20; doc.setFont('times', 'normal'); doc.setFontSize(11);
        doc.text([personal.email, personal.phone, personal.linkedin].filter(Boolean).join(' | '), doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 20; doc.setDrawColor(primaryColor); doc.line(leftMargin, y, rightMargin, y); y += 25;
        
        const addSection = (title, items, itemRenderer) => {
            if (!items || (Array.isArray(items) && items.length === 0) || (typeof items === 'string' && !items)) return;
            doc.setFontSize(12); doc.setFont('times', 'bold'); doc.setTextColor(primaryColor);
            doc.text(title.toUpperCase(), leftMargin, y); y += 5; doc.line(leftMargin, y, rightMargin, y); y += 15;
            doc.setTextColor(secondaryColor); itemRenderer(items); y += 10;
        };
        addSection('Summary', summary ? [summary] : [], (items) => { doc.setFontSize(10); doc.setFont('times', 'normal'); const text = doc.splitTextToSize(items[0], contentWidth); doc.text(text, leftMargin, y); y += text.length * 12 + 10; });
        addSection('Experience', experience, (jobs) => jobs.forEach(job => {
            doc.setFont('times', 'bold'); doc.setFontSize(11); doc.text(job.jobTitle, leftMargin, y);
            doc.setFont('times', 'normal'); doc.text(job.dates, rightMargin, y, { align: 'right' }); y += 14;
            doc.setFont('times', 'italic'); doc.setFontSize(10); doc.text(`${job.company}, ${job.location}`, leftMargin, y); y += 16;
            doc.setFont('times', 'normal');
            (job.duties || []).forEach(duty => { const splitDuty = doc.splitTextToSize(`- ${duty}`, contentWidth - 10); doc.text(splitDuty, leftMargin + 10, y); y += splitDuty.length * 12; });
            y += 10;
        }));
        addSection('Projects', projects, (projs) => projs.forEach(proj => { doc.setFont('times', 'bold'); doc.setFontSize(11); doc.text(proj.name, leftMargin, y); y += 14; doc.setFont('times', 'normal'); doc.setFontSize(10); const d = doc.splitTextToSize(proj.description, contentWidth); doc.text(d, leftMargin, y); y += d.length * 12 + 4; doc.setFont('times', 'italic'); doc.text(`Technologies: ${proj.tech}`, leftMargin, y); y += 20; }));
        addSection('Education', education, (edus) => edus.forEach(edu => { doc.setFont('times', 'bold'); doc.setFontSize(11); doc.text(edu.school, leftMargin, y); doc.setFont('times', 'normal'); doc.text(edu.date, rightMargin, y, { align: 'right' }); y += 14; doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text(`${edu.degree}, ${edu.location}`, leftMargin, y); y += 20; }));
        addSection('Skills', skills && skills.length > 0 ? [skills.join(', ')] : [], (items) => { doc.setFontSize(10); doc.setFont('times', 'normal'); const text = doc.splitTextToSize(items[0], contentWidth); doc.text(text, leftMargin, y); y += text.length * 12; });
        addSection('Certifications', certifications, (certs) => { certs.forEach(cert => { doc.setFontSize(10); doc.setFont('times', 'normal'); doc.text(`- ${cert}`, leftMargin, y); y += 12; }); });
        addSection('Languages', languages && languages.length > 0 ? [languages.join(', ')] : [], (items) => { doc.setFontSize(10); doc.setFont('times', 'normal'); const text = doc.splitTextToSize(items[0], contentWidth); doc.text(text, leftMargin, y); y += text.length * 12; });
    };

    if (template === 'classic') renderClassic(); else renderModern();
    doc.save(`resume-${template}.pdf`);
};
