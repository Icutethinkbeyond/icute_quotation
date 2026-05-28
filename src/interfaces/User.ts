import { RoleName, UserStatus } from "@prisma/client";

// Interface สำหรับ User
export interface User {
  userId: string;
  email: string;
  password?: string;
  name?: string;

  provider?: string;
  providerId?: string;

  imageId?: string;
  imageUrl?: string;
  role?: Role;
  roleId?: string;
  userStatus: UserStatus;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface สำหรับ Role
export interface Role {
  roleId: string;
  name: RoleName;
  description?: string;
  permissions: string; // JSON string array
  createdAt: Date;
  updatedAt: Date;
}

export interface Login {
  email: string;
  password: string;
}

export interface ResetPassword {
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const initialResetPassword: ResetPassword = {
  token: "",
  newPassword: "",
  confirmPassword: "",
};

export const initialLogin: Login = {
  email: "",
  password: ""
};
