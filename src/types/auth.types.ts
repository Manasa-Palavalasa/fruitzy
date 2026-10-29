import {User} from "./index"

export interface AuthResponse {
  token: string;
  user: User;
}