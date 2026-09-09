import{c5 as v,c6 as S,c7 as k,c8 as _,c9 as X,ca as Ae,cb as Q,cc as A,cd as ve,ce as Se,cf as ke,cg as Ce,ch as Ee,ci as _e,cj as z,ck as Re,cl as Pe,cm as De,cn as I}from"./index-DMTKW5_d.js";const Z="@firebase/installations",x="0.6.23";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ee=1e4,te=`w:${x}`,ne="FIS_v2",Fe="https://firebaseinstallations.googleapis.com/v1",Ne=3600*1e3,Me="installations",Oe="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $e={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},w=new X(Me,Oe,$e);function ae(e){return e instanceof Q&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ie({projectId:e}){return`${Fe}/projects/${e}/installations`}function se(e){return{token:e.token,requestStatus:2,expiresIn:qe(e.expiresIn),creationTime:Date.now()}}async function re(e,t){const a=(await t.json()).error;return w.create("request-failed",{requestName:e,serverCode:a.code,serverMessage:a.message,serverStatus:a.status})}function oe({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function xe(e,{refreshToken:t}){const n=oe(e);return n.append("Authorization",Le(t)),n}async function ce(e){const t=await e();return t.status>=500&&t.status<600?e():t}function qe(e){return Number(e.replace("s","000"))}function Le(e){return`${ne} ${e}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ue({appConfig:e,heartbeatServiceProvider:t},{fid:n}){const a=ie(e),i=oe(e),s=t.getImmediate({optional:!0});if(s){const l=await s.getHeartbeatsHeader();l&&i.append("x-firebase-client",l)}const r={fid:n,authVersion:ne,appId:e.appId,sdkVersion:te},o={method:"POST",headers:i,body:JSON.stringify(r)},c=await ce(()=>fetch(a,o));if(c.ok){const l=await c.json();return{fid:l.fid||n,registrationStatus:2,refreshToken:l.refreshToken,authToken:se(l.authToken)}}else throw await re("Create Installation",c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function le(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function je(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ze=/^[cdef][\w-]{21}$/,M="";function Be(){try{const e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;const n=Ve(e);return ze.test(n)?n:M}catch{return M}}function Ve(e){return je(e).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function R(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ue=new Map;function de(e,t){const n=R(e);fe(n,t),Ge(n,t)}function fe(e,t){const n=ue.get(e);if(n)for(const a of n)a(t)}function Ge(e,t){const n=He();n&&n.postMessage({key:e,fid:t}),We()}let g=null;function He(){return!g&&"BroadcastChannel"in self&&(g=new BroadcastChannel("[Firebase] FID Change"),g.onmessage=e=>{fe(e.data.key,e.data.fid)}),g}function We(){ue.size===0&&g&&(g.close(),g=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ke="firebase-installations-database",Ye=1,y="firebase-installations-store";let D=null;function q(){return D||(D=Ae(Ke,Ye,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(y)}}})),D}async function C(e,t){const n=R(e),i=(await q()).transaction(y,"readwrite"),s=i.objectStore(y),r=await s.get(n);return await s.put(t,n),await i.done,(!r||r.fid!==t.fid)&&de(e,t.fid),t}async function pe(e){const t=R(e),a=(await q()).transaction(y,"readwrite");await a.objectStore(y).delete(t),await a.done}async function P(e,t){const n=R(e),i=(await q()).transaction(y,"readwrite"),s=i.objectStore(y),r=await s.get(n),o=t(r);return o===void 0?await s.delete(n):await s.put(o,n),await i.done,o&&(!r||r.fid!==o.fid)&&de(e,o.fid),o}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function L(e){let t;const n=await P(e.appConfig,a=>{const i=Je(a),s=Xe(e,i);return t=s.registrationPromise,s.installationEntry});return n.fid===M?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function Je(e){const t=e||{fid:Be(),registrationStatus:0};return me(t)}function Xe(e,t){if(t.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(w.create("app-offline"));return{installationEntry:t,registrationPromise:i}}const n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},a=Qe(e,n);return{installationEntry:n,registrationPromise:a}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:Ze(e)}:{installationEntry:t}}async function Qe(e,t){try{const n=await Ue(e,t);return C(e.appConfig,n)}catch(n){throw ae(n)&&n.customData.serverCode===409?await pe(e.appConfig):await C(e.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function Ze(e){let t=await B(e.appConfig);for(;t.registrationStatus===1;)await le(100),t=await B(e.appConfig);if(t.registrationStatus===0){const{installationEntry:n,registrationPromise:a}=await L(e);return a||n}return t}function B(e){return P(e,t=>{if(!t)throw w.create("installation-not-found");return me(t)})}function me(e){return et(e)?{fid:e.fid,registrationStatus:0}:e}function et(e){return e.registrationStatus===1&&e.registrationTime+ee<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tt({appConfig:e,heartbeatServiceProvider:t},n){const a=nt(e,n),i=xe(e,n),s=t.getImmediate({optional:!0});if(s){const l=await s.getHeartbeatsHeader();l&&i.append("x-firebase-client",l)}const r={installation:{sdkVersion:te,appId:e.appId}},o={method:"POST",headers:i,body:JSON.stringify(r)},c=await ce(()=>fetch(a,o));if(c.ok){const l=await c.json();return se(l)}else throw await re("Generate Auth Token",c)}function nt(e,{fid:t}){return`${ie(e)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U(e,t=!1){let n;const a=await P(e.appConfig,s=>{if(!he(s))throw w.create("not-registered");const r=s.authToken;if(!t&&st(r))return s;if(r.requestStatus===1)return n=at(e,t),s;{if(!navigator.onLine)throw w.create("app-offline");const o=ot(s);return n=it(e,o),o}});return n?await n:a.authToken}async function at(e,t){let n=await V(e.appConfig);for(;n.authToken.requestStatus===1;)await le(100),n=await V(e.appConfig);const a=n.authToken;return a.requestStatus===0?U(e,t):a}function V(e){return P(e,t=>{if(!he(t))throw w.create("not-registered");const n=t.authToken;return ct(n)?{...t,authToken:{requestStatus:0}}:t})}async function it(e,t){try{const n=await tt(e,t),a={...t,authToken:n};return await C(e.appConfig,a),n}catch(n){if(ae(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await pe(e.appConfig);else{const a={...t,authToken:{requestStatus:0}};await C(e.appConfig,a)}throw n}}function he(e){return e!==void 0&&e.registrationStatus===2}function st(e){return e.requestStatus===2&&!rt(e)}function rt(e){const t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+Ne}function ot(e){const t={requestStatus:1,requestTime:Date.now()};return{...e,authToken:t}}function ct(e){return e.requestStatus===1&&e.requestTime+ee<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lt(e){const t=e,{installationEntry:n,registrationPromise:a}=await L(t);return a?a.catch(console.error):U(t).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ut(e,t=!1){const n=e;return await dt(n),(await U(n,t)).token}async function dt(e){const{registrationPromise:t}=await L(e);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ft(e){if(!e||!e.options)throw F("App Configuration");if(!e.name)throw F("App Name");const t=["projectId","apiKey","appId"];for(const n of t)if(!e.options[n])throw F(n);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function F(e){return w.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ge="installations",pt="installations-internal",mt=e=>{const t=e.getProvider("app").getImmediate(),n=ft(t),a=_(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:a,_delete:()=>Promise.resolve()}},ht=e=>{const t=e.getProvider("app").getImmediate(),n=_(t,ge).getImmediate();return{getId:()=>lt(n),getToken:i=>ut(n,i)}};function gt(){S(new k(ge,mt,"PUBLIC")),S(new k(pt,ht,"PRIVATE"))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */gt();v(Z,x);v(Z,x,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const E="analytics",wt="firebase_id",yt="origin",It=60*1e3,bt="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",j="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const u=new Se("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tt={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},d=new X("analytics","Analytics",Tt);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function At(e){if(!e.startsWith(j)){const t=d.create("invalid-gtag-resource",{gtagURL:e});return u.warn(t.message),""}return e}function we(e){return Promise.all(e.map(t=>t.catch(n=>n)))}function vt(e,t){let n;return window.trustedTypes&&(n=window.trustedTypes.createPolicy(e,t)),n}function St(e,t){const n=vt("firebase-js-sdk-policy",{createScriptURL:At}),a=document.createElement("script"),i=`${j}?l=${e}&id=${t}`;a.src=n?n==null?void 0:n.createScriptURL(i):i,a.async=!0,document.head.appendChild(a)}function kt(e){let t=[];return Array.isArray(window[e])?t=window[e]:window[e]=t,t}async function Ct(e,t,n,a,i,s){const r=a[i];try{if(r)await t[r];else{const c=(await we(n)).find(l=>l.measurementId===i);c&&await t[c.appId]}}catch(o){u.error(o)}e("config",i,s)}async function Et(e,t,n,a,i){try{let s=[];if(i&&i.send_to){let r=i.send_to;Array.isArray(r)||(r=[r]);const o=await we(n);for(const c of r){const l=o.find(p=>p.measurementId===c),f=l&&t[l.appId];if(f)s.push(f);else{s=[];break}}}s.length===0&&(s=Object.values(t)),await Promise.all(s),e("event",a,i||{})}catch(s){u.error(s)}}function _t(e,t,n,a){async function i(s,...r){try{if(s==="event"){const[o,c]=r;await Et(e,t,n,o,c)}else if(s==="config"){const[o,c]=r;await Ct(e,t,n,a,o,c)}else if(s==="consent"){const[o,c]=r;e("consent",o,c)}else if(s==="get"){const[o,c,l]=r;e("get",o,c,l)}else if(s==="set"){const[o]=r;e("set",o)}else e(s,...r)}catch(o){u.error(o)}}return i}function Rt(e,t,n,a,i){let s=function(...r){window[a].push(arguments)};return window[i]&&typeof window[i]=="function"&&(s=window[i]),window[i]=_t(s,e,t,n),{gtagCore:s,wrappedGtag:window[i]}}function Pt(e){const t=window.document.getElementsByTagName("script");for(const n of Object.values(t))if(n.src&&n.src.includes(j)&&n.src.includes(e))return n;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt=30,Ft=1e3;class Nt{constructor(t={},n=Ft){this.throttleMetadata=t,this.intervalMillis=n}getThrottleMetadata(t){return this.throttleMetadata[t]}setThrottleMetadata(t,n){this.throttleMetadata[t]=n}deleteThrottleMetadata(t){delete this.throttleMetadata[t]}}const ye=new Nt;function Mt(e){return new Headers({Accept:"application/json","x-goog-api-key":e})}async function Ot(e){var r;const{appId:t,apiKey:n}=e,a={method:"GET",headers:Mt(n)},i=bt.replace("{app-id}",t),s=await fetch(i,a);if(s.status!==200&&s.status!==304){let o="";try{const c=await s.json();(r=c.error)!=null&&r.message&&(o=c.error.message)}catch{}throw d.create("config-fetch-failed",{httpStatus:s.status,responseMessage:o})}return s.json()}async function $t(e,t=ye,n){const{appId:a,apiKey:i,measurementId:s}=e.options;if(!a)throw d.create("no-app-id");if(!i){if(s)return{measurementId:s,appId:a};throw d.create("no-api-key")}const r=t.getThrottleMetadata(a)||{backoffCount:0,throttleEndTimeMillis:Date.now()},o=new Lt;return setTimeout(async()=>{o.abort()},It),Ie({appId:a,apiKey:i,measurementId:s},r,o,t)}async function Ie(e,{throttleEndTimeMillis:t,backoffCount:n},a,i=ye){var o;const{appId:s,measurementId:r}=e;try{await xt(a,t)}catch(c){if(r)return u.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${r} provided in the "measurementId" field in the local Firebase config. [${c==null?void 0:c.message}]`),{appId:s,measurementId:r};throw c}try{const c=await Ot(e);return i.deleteThrottleMetadata(s),c}catch(c){const l=c;if(!qt(l)){if(i.deleteThrottleMetadata(s),r)return u.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${r} provided in the "measurementId" field in the local Firebase config. [${l==null?void 0:l.message}]`),{appId:s,measurementId:r};throw c}const f=Number((o=l==null?void 0:l.customData)==null?void 0:o.httpStatus)===503?z(n,i.intervalMillis,Dt):z(n,i.intervalMillis),p={throttleEndTimeMillis:Date.now()+f,backoffCount:n+1};return i.setThrottleMetadata(s,p),u.debug(`Calling attemptFetch again in ${f} millis`),Ie(e,p,a,i)}}function xt(e,t){return new Promise((n,a)=>{const i=Math.max(t-Date.now(),0),s=setTimeout(n,i);e.addEventListener(()=>{clearTimeout(s),a(d.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}function qt(e){if(!(e instanceof Q)||!e.customData)return!1;const t=Number(e.customData.httpStatus);return t===429||t===500||t===503||t===504}class Lt{constructor(){this.listeners=[]}addEventListener(t){this.listeners.push(t)}abort(){this.listeners.forEach(t=>t())}}async function Ut(e,t,n,a,i){if(i&&i.global){e("event",n,a);return}else{const s=await t,r={...a,send_to:s};e("event",n,r)}}async function jt(e,t,n,a){{const i=await t;e("config",i,{update:!0,user_id:n})}}async function zt(e,t,n,a){if(a&&a.global){const i={};for(const s of Object.keys(n))i[`user_properties.${s}`]=n[s];return e("set",i),Promise.resolve()}else{const i=await t;e("config",i,{update:!0,user_properties:n})}}async function Bt(e,t){const n=await e;window[`ga-disable-${n}`]=!t}let O;function be(e){O=e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vt(){if(Ee())try{await _e()}catch(e){return u.warn(d.create("indexeddb-unavailable",{errorInfo:e==null?void 0:e.toString()}).message),!1}else return u.warn(d.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function Gt(e,t,n,a,i,s,r){const o=$t(e);o.then(m=>{n[m.measurementId]=m.appId,e.options.measurementId&&m.measurementId!==e.options.measurementId&&u.warn(`The measurement ID in the local Firebase config (${e.options.measurementId}) does not match the measurement ID fetched from the server (${m.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(m=>u.error(m)),t.push(o);const c=Vt().then(m=>{if(m)return a.getId()}),[l,f]=await Promise.all([o,c]);Pt(s)||St(s,l.measurementId),O&&(i("consent","default",O),be(void 0)),i("js",new Date);const p=(r==null?void 0:r.config)??{};return p[yt]="firebase",p.update=!0,f!=null&&(p[wt]=f),i("config",l.measurementId,p),l.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(t){this.app=t}_delete(){return delete h[this.app.options.appId],Promise.resolve()}}let h={},G=[];const H={};let N="dataLayer",Wt="gtag",W,b,K=!1;function Kt(){const e=[];if(Ce()&&e.push("This is a browser extension environment."),Re()||e.push("Cookies are not available."),e.length>0){const t=e.map((a,i)=>`(${i+1}) ${a}`).join(" "),n=d.create("invalid-analytics-context",{errorInfo:t});u.warn(n.message)}}function Yt(e,t,n){Kt();const a=e.options.appId;if(!a)throw d.create("no-app-id");if(!e.options.apiKey)if(e.options.measurementId)u.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${e.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw d.create("no-api-key");if(h[a]!=null)throw d.create("already-exists",{id:a});if(!K){kt(N);const{wrappedGtag:s,gtagCore:r}=Rt(h,G,H,N,Wt);b=s,W=r,K=!0}return h[a]=Gt(e,G,H,t,W,N,n),new Ht(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function T(e=ve()){e=A(e);const t=_(e,E);return t.isInitialized()?t.getImmediate():Jt(e)}function Jt(e,t={}){const n=_(e,E);if(n.isInitialized()){const i=n.getImmediate();if(ke(t,n.getOptions()))return i;throw d.create("already-initialized")}return n.initialize({options:t})}function Xt(e,t,n){e=A(e),jt(b,h[e.app.options.appId],t).catch(a=>u.error(a))}function Te(e,t,n){e=A(e),zt(b,h[e.app.options.appId],t,n).catch(a=>u.error(a))}function Qt(e,t){e=A(e),Bt(h[e.app.options.appId],t).catch(n=>u.error(n))}function $(e,t,n,a){e=A(e),Ut(b,h[e.app.options.appId],t,n,a).catch(i=>u.error(i))}function Zt(e){b?b("consent","update",e):be(e)}const Y="@firebase/analytics",J="0.10.23";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function en(){S(new k(E,(t,{options:n})=>{const a=t.getProvider("app").getImmediate(),i=t.getProvider("installations-internal").getImmediate();return Yt(a,i,n)},"PUBLIC")),S(new k("analytics-internal",e,"PRIVATE")),v(Y,J),v(Y,J,"esm2020");function e(t){try{const n=t.getProvider(E).getImmediate();return{logEvent:(a,i,s)=>$(n,a,i,s),setUserProperties:(a,i)=>Te(n,a,i)}}catch(n){throw d.create("interop-component-reg-failed",{reason:n})}}}en();class nn extends Pe{async getAppInstanceId(){throw this.unimplemented("Not implemented on web.")}async setConsent(t){const n=t.status===De.Granted?"granted":"denied",a={};switch(t.type){case I.AdPersonalization:a.ad_personalization=n;break;case I.AdStorage:a.ad_storage=n;break;case I.AdUserData:a.ad_user_data=n;break;case I.AnalyticsStorage:a.analytics_storage=n;break;case I.FunctionalityStorage:a.functionality_storage=n;break;case I.PersonalizationStorage:a.personalization_storage=n;break}Zt(a)}async setUserId(t){const n=T();Xt(n,t.userId)}async setUserProperty(t){const n=T();Te(n,{[t.key]:t.value})}async setCurrentScreen(t){const n=T();$(n,"screen_view",{firebase_screen:t.screenName||void 0,firebase_screen_class:t.screenClassOverride||void 0})}async logEvent(t){const n=T();$(n,t.name,t.params)}async logTransaction(t){throw this.unimplemented("Not implemented on web.")}async setSessionTimeoutDuration(t){throw this.unimplemented("Not implemented on web.")}async setEnabled(t){const n=T();Qt(n,t.enabled)}async isEnabled(){return{enabled:window["ga-disable-analyticsId"]===!0}}async resetAnalyticsData(){throw this.unimplemented("Not implemented on web.")}async initiateOnDeviceConversionMeasurementWithEmailAddress(t){throw this.unimplemented("Not implemented on web.")}async initiateOnDeviceConversionMeasurementWithPhoneNumber(t){throw this.unimplemented("Not implemented on web.")}async initiateOnDeviceConversionMeasurementWithHashedEmailAddress(t){throw this.unimplemented("Not implemented on web.")}async initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(t){throw this.unimplemented("Not implemented on web.")}}export{nn as FirebaseAnalyticsWeb};
