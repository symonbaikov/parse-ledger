'use client';

import Image from 'next/image';
import { FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import pdfIcon from '../../public/images/pdf.png';

const normalizeType = (fileType?: string, fileName?: string): string => {
  const type = (fileType || '').trim().toLowerCase();
  const name = (fileName || '').trim().toLowerCase();

  if (type) return type;

  const dot = name.lastIndexOf('.');
  if (dot === -1) return '';
  return name.slice(dot + 1);
};

export function DocumentTypeIcon(props: {
  fileType?: string;
  fileName?: string;
  size?: number;
  className?: string;
}) {
  const size = props.size ?? 20;
  const type = normalizeType(props.fileType, props.fileName);

  const isPdf = type === 'pdf' || type.includes('pdf') || type.endsWith('/pdf') || type === 'application/pdf';
  if (isPdf) {
    const pdfSize = Math.round((size || 20) * 2);
    return (
      <Image
        src={pdfIcon}
        alt="PDF"
        width={pdfSize}
        height={pdfSize}
        className={props.className}
        unoptimized
      />
    );
  }

  const isSpreadsheet =
    type === 'xlsx' ||
    type === 'xls' ||
    type === 'csv' ||
    type.includes('spreadsheet') ||
    type.includes('excel') ||
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    type === 'application/vnd.ms-excel' ||
    type === 'text/csv';
  if (isSpreadsheet) {
    return <FileSpreadsheet size={size} className={props.className} />;
  }

  const isImage = type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(type);
  if (isImage) {
    return <FileImage size={size} className={props.className} />;
  }

  return <FileText size={size} className={props.className} />;
}
