import apiClient from './client';

// ---- 型定義 ----
export interface FunctionalRole {
  tenantId: string;
  id: string;
  name: string;
}

export interface DataRole {
  tenantId: string;
  id: string;
  name: string;
  namespaces?: DataRoleNamespace[];
}

export interface DataRoleNamespace {
  tenantId: string;
  dataRoleId: string;
  namespaceId: string;
  namespace: Namespace;
}

export interface Namespace {
  tenantId: string;
  id: string;
  name: string;
}

export interface User {
  tenantId: string;
  id: string;
  name: string;
  email: string;
  functionalRoleId: string;
  dataRoleId: string;
  functionalRole: FunctionalRole;
  dataRole: DataRole;
}

// ---- API呼び出し ----
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/settings/users');
  return response.data;
};

export const getUser = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/settings/users/${userId}`);
  return response.data;
};

export const updateUserDataRole = async (userId: string, dataRoleId: string): Promise<User> => {
  const response = await apiClient.patch<User>(`/settings/users/${userId}/data-role`, { dataRoleId });
  return response.data;
};

export const getDataRoles = async (): Promise<DataRole[]> => {
  const response = await apiClient.get<DataRole[]>('/settings/data-roles');
  return response.data;
};

export const getDataRole = async (dataRoleId: string): Promise<DataRole> => {
  const response = await apiClient.get<DataRole>(`/settings/data-roles/${dataRoleId}`);
  return response.data;
};

export const getNamespaces = async (): Promise<Namespace[]> => {
  const response = await apiClient.get<Namespace[]>('/settings/namespaces');
  return response.data;
};

export const updateDataRoleNamespaces = async (dataRoleId: string, namespaceIds: string[]): Promise<DataRole> => {
  const response = await apiClient.patch<DataRole>(`/settings/data-roles/${dataRoleId}/namespaces`, { namespaceIds });
  return response.data;
};