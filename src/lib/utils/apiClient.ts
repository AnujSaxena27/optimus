/**
 * Authenticated API Request Utilities
 * Helper functions for making API requests with JWT token from Supabase session
 */

/**
 * Get the current Supabase session and access token
 * For use in client-side components
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    // This should be called within a component that has access to AuthContext
    // The token will be available via the useAuth hook
    return null; // Token should come from useAuth hook instead
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request to the backend
 * Automatically includes the JWT token in Authorization header
 * 
 * @param url - API endpoint path (e.g., '/api/chat', '/api/models')
 * @param token - Supabase access token from session.access_token
 * @param options - Fetch options (method, body, etc.)
 */
export async function fetchWithAuth(
  url: string,
  token: string,
  options?: RequestInit
): Promise<Response> {
  if (!token) {
    throw new Error('Access token is required for authenticated requests');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options?.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make an authenticated API request and parse JSON response
 * 
 * @param url - API endpoint path
 * @param token - Supabase access token
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function fetchWithAuthJSON<T>(
  url: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetchWithAuth(url, token, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error?.error || error?.message || response.statusText;
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

/**
 * Make a POST request to /api/chat with authentication
 * 
 * @param message - User message
 * @param model - Model ID to use
 * @param token - Supabase access token
 * @param options - Additional parameters (temperature, maxTokens)
 */
export async function chatWithAuth(
  message: string,
  model: string,
  token: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<any> {
  return fetchWithAuthJSON('/api/chat', token, {
    method: 'POST',
    body: JSON.stringify({
      message,
      model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    }),
  });
}
