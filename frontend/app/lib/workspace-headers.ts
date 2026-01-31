export const getWorkspaceHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const token = localStorage.getItem('access_token');
  const workspaceId = localStorage.getItem('currentWorkspaceId');
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (workspaceId) {
    headers['X-Workspace-Id'] = workspaceId;
  }

  return headers;
};
