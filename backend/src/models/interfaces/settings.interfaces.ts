export interface ServerSettings {
  serverEnvironment: "PRODUCTION" | "STAGING" | "DEVELOPMENT" | "TEST";
  serverPort: number;
  jwtSecretKey: string;
  bcryptHashingSalt: string;
  email: {
    username: string;
    fromAddress: string;
    password: string;
  };
  auroraWebApp: {
    baseUrl: string
  }
}
