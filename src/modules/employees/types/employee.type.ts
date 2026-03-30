export type Employee = {
  _id: string;
  accountId: string;
  workspaceIds: string[];
  name: string;
  lastName: string;
  phone: string;
  role: EmployeeRole;
  isSystemUser: boolean;
  userId?: string;
  managedWorkspaceId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRole =
  | 'WORKSPACE_MANAGER'
  | 'SELLER'
  | 'MANUFACTURER'
  | 'TRANSPORTER'
  | 'GENERAL_SUPPORT';
