import apiClient from './client';

export interface SecurityResult {
  id: string;
  action: string;
  severity?: string;
  description?: string;
  category?: string;
}

export interface Event {
  id: string;
  metadata_eventTimestamp: string;
  metadata_eventType: string;
  metadata_logType: string;
  metadata_vendorName: string;
  metadata_productName: string;
  principal_hostname?: string;
  principal_ip?: string;
  principal_user_userid?: string;
  principal_user_email?: string;
  principal_process_pid?: string;
  principal_process_commandLine?: string;
  target_hostname?: string;
  target_ip?: string;
  target_user_userid?: string;
  target_user_email?: string;
  target_url?: string;
  target_resourceName?: string;
  metadata_ingestedTimestamp: string;
  securityResults: SecurityResult[];
}

export interface SearchResponse {
  data: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchParams {
  filter?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

export const searchEvents = async (
  params: SearchParams,
): Promise<SearchResponse> => {
  const response = await apiClient.get<SearchResponse>('/events', { params });
  return response.data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const response = await apiClient.get<Event>(`/events/${id}`);
  return response.data;
};
