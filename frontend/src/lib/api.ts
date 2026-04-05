import { Feedback } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const submitFeedback = async (data: Partial<Feedback>) => {
  const res = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginAdmin = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getFeedback = async (token: string, filters?: Record<string, string>) => {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/feedback?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const updateFeedbackStatus = async (token: string, id: string, status: string) => {
  const res = await fetch(`${API_URL}/feedback/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const getSummary = async (token: string) => {
  const res = await fetch(`${API_URL}/feedback/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getAISummary = async (token: string) => {
  const res = await fetch(`${API_URL}/feedback/summary-ai`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const triggerReanalyze = async (token: string, id: string) => {
  const res = await fetch(`${API_URL}/feedback/${id}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
