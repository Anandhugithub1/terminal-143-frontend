// features/AgeVerification/amplifyConfig.js
//
// Configures AWS Amplity Auth so the FaceLivenessDetector can obtain
// short-lived, Rekognition-scoped credentials for the logged-in user via the
// Cognito Identity Pool. This does NOT create or manage users — it federates
// our existing Cognito User Pool login into temporary AWS credentials that can
// only call StartFaceLivenessSession.
//
// Values come from Vite env so nothing sensitive is hard-coded:
//   VITE_COGNITO_USER_POOL_ID
//   VITE_COGNITO_USER_POOL_CLIENT_ID
//   VITE_COGNITO_IDENTITY_POOL_ID
//   VITE_REKOGNITION_REGION (default us-east-1)
import { Amplify } from "aws-amplify"

let configured = false

export function configureAmplify() {
  if (configured) return
  const region = import.meta.env.VITE_REKOGNITION_REGION || "us-east-1"
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
  const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
  const identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID

  if (!identityPoolId || !userPoolId) {
    // Not configured (e.g. feature not enabled for this build) — leave Amplify
    // unconfigured; the flow will surface a friendly error if it's ever reached.
    return
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        region,
        userPoolId,
        userPoolClientId,
        identityPoolId,
        // We already authenticate via our own backend; Amplify only needs the
        // Identity Pool to mint Rekognition credentials for the current user.
        allowGuestAccess: false,
      },
    },
  })
  configured = true
}
