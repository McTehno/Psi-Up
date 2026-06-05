import type { ErrorResponse } from '../types/api'
import { supabase } from './supabase-client'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers: Record<string, string> = {}

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  return headers
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const errorData = data as ErrorResponse | null

    const message =
      errorData?.error?.message ||
      'Prišlo je do napake pri komunikaciji s strežnikom.'

    throw new Error(message)
  }

  return data as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
  })

  return parseResponse<T>(response)
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const authHeaders = await getAuthHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  })

  return parseResponse<TResponse>(response)
}

export async function apiPut<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const authHeaders = await getAuthHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  })

  return parseResponse<TResponse>(response)
}

export async function apiPatch<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const authHeaders = await getAuthHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  })

  return parseResponse<TResponse>(response)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers,
  })

  return parseResponse<T>(response)
}

export async function apiDeleteWithBody<TResponse, TBody>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })

  return parseResponse<TResponse>(response)
}

