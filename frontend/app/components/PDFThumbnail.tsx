"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import pdfIcon from "../../public/images/pdf.png";

interface PDFThumbnailProps {
  fileId: string;
  fileName?: string;
  size?: number;
  className?: string;
}

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/api/v1").replace(
  /\/$/,
  "",
);

export function PDFThumbnail({
  fileId,
  fileName,
  size = 40,
  className = "",
}: PDFThumbnailProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchThumbnail = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError(true);
          setLoading(false);
          return;
        }

        const thumbnailUrl = `${apiBaseUrl}/statements/${fileId}/thumbnail`;

        const response = await fetch(thumbnailUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
          return;
        }

        const blob = await response.blob();
        const dataUrl = URL.createObjectURL(blob);

        if (isMounted) {
          setThumbnailDataUrl(dataUrl);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchThumbnail();

    return () => {
      isMounted = false;
      if (thumbnailDataUrl) {
        URL.revokeObjectURL(thumbnailDataUrl);
      }
    };
  }, [fileId, thumbnailDataUrl]);

  // If error occurred, show default PDF icon
  if (error) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          src={pdfIcon}
          alt="PDF"
          width={size * 0.6}
          height={size * 0.6}
          className={className}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className="relative shadow-sm rounded-xl overflow-hidden"
      style={{ width: size, height: size }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600" />
        </div>
      )}
      {thumbnailDataUrl && (
        <img
          src={thumbnailDataUrl}
          alt={fileName || "PDF thumbnail"}
          className={`w-full h-full object-contain ${className}`}
          style={{ transition: "opacity 0.2s" }}
        />
      )}
    </div>
  );
}
