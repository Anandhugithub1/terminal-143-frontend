import{f as n}from"./index-DMTKW5_d.js";/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],h=n("clock",o),f="https://d36zx1g74mcorc.cloudfront.net/websitephotos/avatar.svg",s=e=>{if(!e)return"";const t=Math.max(0,(Date.now()-e)/1e3);return t<60?"Just now":t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:`${Math.floor(t/86400)}d ago`},c=e=>{if(!e)return null;const t=new Date(e);if(Number.isNaN(t.getTime()))return null;const a=new Date;let r=a.getFullYear()-t.getFullYear();return a.getMonth()>t.getMonth()||a.getMonth()===t.getMonth()&&a.getDate()>=t.getDate()||(r-=1),r},l={M:"Male",F:"Female",O:"Other"},i=e=>e?l[e.toUpperCase()]||e:null,m=e=>{const t=c(e==null?void 0:e.authorDob),a=i(e==null?void 0:e.authorGender),r=[t,a].filter(Boolean).join(", ");return r?`(${r})`:null},D=e=>(e==null?void 0:e.authorDisplayName)||(e==null?void 0:e.authorName)||"";export{h as C,f as D,D as a,s as f,m as g};
