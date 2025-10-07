import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
];

const serviceAccount = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT!, "base64").toString("utf-8")
);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: SCOPES,
});


export const getGoogleServices = async () => {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: "v3", auth: authClient });
  return { drive };
};