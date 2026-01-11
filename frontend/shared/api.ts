/**
 * API Service for connecting frontend to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Types
export type UserRole = 'viewer' | 'editor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  filename: string;
  originalFilename: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'analyzing' | 'completed' | 'failed';
  thumbnail?: string;
  thumbnailPath?: string;
  duration?: number;
  views: number;
  organization: string;
  uploader?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  privacy: 'public' | 'private' | 'organization';
  tags?: string[];
  category?: string;
  customCategories?: string[];
  sensitivityLevel?: 'low' | 'medium' | 'high';
  sensitivityAnalysis?: {
    score: number;
    categories: string[];
    flagged: boolean;
    analyzedAt?: string;
  };
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  success: false;
  message: string;
}

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Helper function to get headers
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data as T;
};

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string, organizationName: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, password, organizationName }),
    });

    const data = await handleResponse<AuthResponse>(response);
    if (data.success && data.token) {
      setToken(data.token);
    }
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse<AuthResponse>(response);
    if (data.success && data.token) {
      setToken(data.token);
    }
    return data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; user: User }>(response);
  },

  logout: (): void => {
    removeToken();
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

// Video API
export const videoApi = {
  getVideos: async (): Promise<{ success: boolean; videos: Video[] }> => {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; videos: Video[] }>(response);
  },

  getVideo: async (id: string): Promise<{ success: boolean; video: Video }> => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; video: Video }>(response);
  },

  uploadVideo: async (file: File, title: string, description?: string): Promise<{ success: boolean; video: Video }> => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return handleResponse<{ success: boolean; video: Video }>(response);
  },

  updateVideo: async (id: string, updates: { title?: string; description?: string }): Promise<{ success: boolean; video: Video }> => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });

    return handleResponse<{ success: boolean; video: Video }>(response);
  },

  deleteVideo: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; message: string }>(response);
  },

  getVideoStreamUrl: (id: string, quality: string = '720'): string => {
    const token = getToken();
    const url = `${API_BASE_URL}/videos/${id}/stream?quality=${quality}`;
    return url;
  },

  getThumbnailUrl: (id: string): string => {
    return `${API_BASE_URL}/videos/${id}/thumbnail`;
  },

  getProcessingStatus: async (id: string): Promise<{ success: boolean; status: string; progress?: number }> => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}/status`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; status: string; progress?: number }>(response);
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; user: User }>(response);
  },

  updateProfile: async (updates: { name?: string; email?: string }): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });

    return handleResponse<{ success: boolean; user: User }>(response);
  },

  // Admin functions
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: boolean; user: User; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });

    return handleResponse<{ success: boolean; user: User; message?: string }>(response);
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
    isActive?: boolean;
  }): Promise<{ success: boolean; users: User[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; users: User[]; pagination: any }>(response);
  },

  getUser: async (id: string): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; user: User }>(response);
  },

  updateUserRole: async (id: string, role: UserRole): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ role }),
    });

    return handleResponse<{ success: boolean; user: User }>(response);
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ isActive }),
    });

    return handleResponse<{ success: boolean; user: User }>(response);
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    return handleResponse<{ success: boolean; message: string }>(response);
  },
};

// Export token management functions
export { getToken, setToken, removeToken };
