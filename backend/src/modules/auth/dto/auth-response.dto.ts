export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}








