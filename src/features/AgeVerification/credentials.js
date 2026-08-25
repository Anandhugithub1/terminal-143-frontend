// features/AgeVerification/credentials.js
//
// Mints short-lived, Rekognition-scoped AWS credentials for the CURRENT logged-in
// user, so the browser FaceLivenessDetector can call StartFaceLivenessSession.
//
// Flow: user's Cognito idToken -> Cognito Identity Pool -> temporary credentials
// that can ONLY call rekognition:StartFaceLivenessSession (per the auth role).
//
// The idToken:
//   - native: read from tokenStore (localStorage)
//   - web:    the app's idToken lives in an httpOnly cookie (not JS-readable),
//             so the backend exposes it for this purpose via GET /user/age/id-token.
//
// No long-lived AWS keys ever touch the client.
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from "@aws-sdk/client-cognito-identity"
import { getTokens, isNativeClient } from "../../shared/auth/tokenStore"
import { userProfilesApi } from "../../api/clients"

const REGION = import.meta.env.VITE_REKOGNITION_REGION || "us-east-1"
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID
const IDENTITY_POOL_ID = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID

const providerName = () => `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`

// Get the Cognito idToken for the current user (native store or web endpoint).
async function getIdToken() {
  if (isNativeClient()) {
    const { idToken } = getTokens()
    if (idToken) return idToken
  }
  // Web: fetch from backend (reads the httpOnly cookie server-side).
  const res = await userProfilesApi.get("/v0.2/user/age/id-token", { withCredentials: true })
  return res.data?.idToken || null
}

// Returns an AWS credentials provider function the Amplify FaceLivenessDetector
// can use. Throws if the user isn't authenticated / config missing.
export function makeLivenessCredentialsProvider() {
  return async () => {
    if (!IDENTITY_POOL_ID || !USER_POOL_ID) {
      throw new Error("Age verification is not configured")
    }
    const idToken = await getIdToken()
    if (!idToken) throw new Error("Not authenticated")

    const client = new CognitoIdentityClient({ region: REGION })
    const logins = { [providerName()]: idToken }

    const { IdentityId } = await client.send(
      new GetIdCommand({ IdentityPoolId: IDENTITY_POOL_ID, Logins: logins })
    )
    const { Credentials } = await client.send(
      new GetCredentialsForIdentityCommand({ IdentityId, Logins: logins })
    )

    return {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
    }
  }
}
