import jsPDF from 'jspdf';
import { domToCanvas } from 'modern-screenshot';
import { Person, Relationship, FamilyTree } from '@/types';

export interface ExportData {
  tree: FamilyTree;
  persons: Person[];
  relationships: Relationship[];
}

export const pdfService = {
  // Xuất bản Gia Phả họ tộc sang định dạng PDF.
  async generateLegacyBook(
    data: ExportData, 
    treeElement: HTMLElement,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { tree } = data;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const container = document.getElementById('legacy-book-export-container');
    if (!container) throw new Error('Template export không tồn tại.');

    const pages = container.querySelectorAll('.page-export');
    const totalPages = pages.length + 1;
    let currentStep = 0;

    const updateProgress = () => {
      currentStep++;
      if (onProgress) onProgress(currentStep, totalPages);
    };
    
    await this.addCapturedPage(doc, pages[0] as HTMLElement);
    updateProgress();

    doc.addPage('a4', 'landscape');
    await this.addCapturedPage(doc, treeElement);
    updateProgress();

    for (let i = 1; i < pages.length; i++) {
      doc.addPage('a4', 'portrait');
      await this.addCapturedPage(doc, pages[i] as HTMLElement);
      updateProgress();
    }

    const fileName = `${this.slugify(tree.name)}-gia-pha.pdf`;
    doc.save(fileName);
  },

  // Chụp thành phần giao diện và nhúng vào trang hiện tại của PDF.
  async addCapturedPage(doc: jsPDF, element: HTMLElement) {
    const canvas = await domToCanvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('export-exclude')) {
          return false;
        }
        return true;
      },
      features: {
        removeControlCharacter: true
      }
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let finalWidth = pageWidth;
    let finalHeight = (canvas.height * finalWidth) / canvas.width;
    
    if (finalHeight > pageHeight) {
      finalHeight = pageHeight;
      finalWidth = (canvas.width * finalHeight) / canvas.height;
    }

    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    doc.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
  },

  // Chuyển đổi tên sang định dạng slug không dấu cho tên file.
  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  },
};
