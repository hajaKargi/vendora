export interface IRegisterUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  walletAddress: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IVerifyEmail {
  token: string;
}
