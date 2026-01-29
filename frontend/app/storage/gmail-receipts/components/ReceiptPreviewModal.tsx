'use client';

import { gmailReceiptsApi } from '@/app/lib/api';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface ReceiptPreviewModalProps {
  receiptId: string;
  onClose: () => void;
}

export function ReceiptPreviewModal({ receiptId, onClose }: ReceiptPreviewModalProps) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    loadPreview();
  }, [receiptId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const response = await gmailReceiptsApi.getReceiptPreview(receiptId);
      setPreview(response.data);
    } catch (error) {
      console.error('Failed to load preview', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50" onClick={onClose} />
      <div className="fixed inset-4 bg-white rounded-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Receipt Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg ml-4">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading preview...</div>
            </div>
          ) : preview ? (
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
              {/* Render attachment if available */}
              {preview.attachmentData && preview.attachmentData.length > 0 ? (
                <div className="space-y-4">
                  {preview.attachmentData.map((attachment: any, idx: number) => {
                    const isPDF = attachment.mimeType === 'application/pdf';
                    const isImage = attachment.mimeType?.startsWith('image/');

                    // Convert base64url to base64
                    const base64Data = attachment.data.replace(/-/g, '+').replace(/_/g, '/');
                    const dataUrl = `data:${attachment.mimeType};base64,${base64Data}`;

                    return (
                      <div key={idx} className="bg-white border rounded-lg">
                        <div className="p-3 border-b bg-gray-50">
                          <span className="text-sm font-medium">{attachment.filename}</span>
                        </div>
                        <div className="p-4">
                          {isPDF ? (
                            <iframe
                              src={dataUrl}
                              className="w-full h-[600px] border rounded"
                              title={attachment.filename}
                            />
                          ) : isImage ? (
                            <img
                              src={dataUrl}
                              alt={attachment.filename}
                              className="max-w-full h-auto rounded"
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              <p>Preview not available for this file type</p>
                              <p className="text-sm mt-2">{attachment.mimeType}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : preview.emailBody ? (
                <div
                  className="bg-white border rounded-lg p-4"
                  dangerouslySetInnerHTML={{ __html: preview.emailBody }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No preview available</p>
                  {preview.snippet && <p className="mt-2 text-sm">{preview.snippet}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Failed to load preview</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
