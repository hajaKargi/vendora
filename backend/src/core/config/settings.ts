import { ServerSettings } from "../../models/interfaces/settings.interfaces";

const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    SERVER_ENVIRONMENT: Joi.string()
      .valid("PRODUCTION", "STAGING", "DEVELOPMENT", "TEST")
      .required(),
    SERVER_PORT: Joi.number().default(8000),
    EMAIL_USERNAME: Joi.string().description("Email username "),
    EMAIL_PASSWORD: Joi.string().description("Email password "),
    EMAIL_FROM_ADDRESS: Joi.string().description("Zoho from address"),
    AURORA_WEB_APP_BASE_URL: Joi.string().description(
      "This is the base URL for the web app"
    ),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const serverSettings: ServerSettings = {
  serverEnvironment: envVars.SERVER_ENVIRONMENT,
  serverPort: envVars.SERVER_PORT,
  bcryptHashingSalt: envVars.BCRYPT_HASHING_SALT,
  jwtSecretKey: envVars.JWT_SECRET_KEY,
  email: {
    username: envVars.EMAIL_USERNAME,
    fromAddress: envVars.EMAIL_FROM_ADDRESS,
    password: envVars.EMAIL_PASSWORD,
  },
  auroraWebApp: {
    baseUrl: envVars.AURORA_WEB_APP_BASE_URL
  },
};

export default serverSettings;
