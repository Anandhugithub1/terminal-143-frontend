import { userProfilesApi } from "../../api/clients";


export async function getPresignedUrl(payload) {
  const res = await userProfilesApi.post("/circles/predesignedurl", payload, {
    withCredentials: true, 
    headers: { "Content-Type": "application/json" }
  });

  return res?.data ?? res;
}


export async function createCircle(payload, {  } = {}) {
  const headers = {};

 

  const res = await userProfilesApi.post("/circles/create", payload, {
    headers,
    withCredentials: true, 
  });

  // backend returns: { circleId, message, circle }
  return res?.data?.circle ?? res.data;
}

export default {
  createCircle,
  getPresignedUrl
};