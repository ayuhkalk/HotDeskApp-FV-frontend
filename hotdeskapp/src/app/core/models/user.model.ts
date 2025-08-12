export interface User {
  id: number;
  name?: string;
  firstName: string;
  lastName: string;  
  email: string;
  role: UserRole;
  isAdmin: boolean;

}

export enum UserRole {
  Employee = 0,
  Admin = 1
}
export interface LoginRequest {
  email: string;
  password: string;
}