export default () => ({
  auth: {
    grantType: process.env.Grant_Type,
    clientId: process.env.Client_Id,
    clientSecret: process.env.Client_Secret,
    resource: process.env.Resource,
    url: process.env.Token_Url,
  },
  base: {
    url: process.env.Base_Url,
  },
});
