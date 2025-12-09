import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export const exportAsText = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${filename}.txt`);
};

export const exportAsDocx = async (content: string, filename: string): Promise<void> => {
  const lines = content.split('\n');
  const children: Paragraph[] = [];

  lines.forEach(line => {
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.replace('# ', ''),
        heading: HeadingLevel.HEADING_1,
      }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        text: line.replace('## ', ''),
        heading: HeadingLevel.HEADING_2,
      }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        text: line.replace('### ', ''),
        heading: HeadingLevel.HEADING_3,
      }));
    } else if (line.startsWith('- ')) {
      children.push(new Paragraph({
        children: [new TextRun(line.replace('- ', '• '))],
      }));
    } else if (line.trim() === '') {
      children.push(new Paragraph({ text: '' }));
    } else {
      children.push(new Paragraph({
        children: [new TextRun(line)],
      }));
    }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

export const exportAsPdf = (content: string, filename: string): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  const lines = doc.splitTextToSize(content, maxWidth);
  let y = margin;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.getHeight();

  lines.forEach((line: string) => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(`${filename}.pdf`);
};

export const exportAsCsv = (content: string, filename: string): void => {
  // Convert content to CSV format - useful for structured data like NPC lists
  const lines = content.split('\n');
  const csvLines: string[] = [];

  // Try to detect if content has structured data
  let currentSection = '';

  lines.forEach(line => {
    if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
      currentSection = line.replace(/^#+ /, '');
      csvLines.push(`"Section","${currentSection}"`);
    } else if (line.startsWith('- ')) {
      const item = line.replace('- ', '');
      csvLines.push(`"${currentSection}","${item.replace(/"/g, '""')}"`);
    } else if (line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim());
      csvLines.push(`"${key}","${(value || '').replace(/"/g, '""')}"`);
    } else if (line.trim()) {
      csvLines.push(`"Content","${line.replace(/"/g, '""')}"`);
    }
  });

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
};

export const exportContent = async (
  content: string,
  filename: string,
  format: 'text' | 'docx' | 'pdf' | 'csv'
): Promise<void> => {
  switch (format) {
    case 'text':
      exportAsText(content, filename);
      break;
    case 'docx':
      await exportAsDocx(content, filename);
      break;
    case 'pdf':
      exportAsPdf(content, filename);
      break;
    case 'csv':
      exportAsCsv(content, filename);
      break;
    default:
      exportAsText(content, filename);
  }
};
