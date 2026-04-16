// Thin wrapper that delegates to movie-payroll's existing axios instance
import api from '../lib/axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export function get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.get<T>(url, config);
}

export function post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.post<T>(url, data, config);
}

export function put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.put<T>(url, data, config);
}

export function patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.patch<T>(url, data, config);
}

export function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.delete<T>(url, config);
}

export default api;
