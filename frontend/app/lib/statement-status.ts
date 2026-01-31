export const isStatementProcessingStatus = (status?: string | null): boolean => {
  const normalized = (status || '').toLowerCase();
  return normalized === 'processing' || normalized === 'uploaded';
};

export const getStatementMerchantLabel = (
  status: string | null | undefined,
  merchant: string,
  scanningLabel: string,
): string => (isStatementProcessingStatus(status) ? scanningLabel : merchant);
