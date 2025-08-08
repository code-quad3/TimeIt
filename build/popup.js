import{r as o,j as s,c as y}from"./assets/client-CqkKm-JI.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),j=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,a)=>a?a.toUpperCase():r.toLowerCase()),m=e=>{const t=j(e);return t.charAt(0).toUpperCase()+t.slice(1)},u=(...e)=>e.filter((t,r,a)=>!!t&&t.trim()!==""&&a.indexOf(t)===r).join(" ").trim(),w=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var v={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=o.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:a,className:c="",children:n,iconNode:l,...i},p)=>o.createElement("svg",{ref:p,...v,width:t,height:t,stroke:e,strokeWidth:a?Number(r)*24/Number(t):r,className:u("lucide",c),...!n&&!w(i)&&{"aria-hidden":"true"},...i},[...l.map(([x,f])=>o.createElement(x,f)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=(e,t)=>{const r=o.forwardRef(({className:a,...c},n)=>o.createElement(b,{ref:n,iconNode:t,className:u(`lucide-${g(m(e))}`,`lucide-${e}`,a),...c}));return r.displayName=m(e),r};/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m4.9 4.9 14.2 14.2",key:"1m5liu"}]],C=d("ban",N);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["path",{d:"M13 17V9",key:"1fwyjl"}],["path",{d:"M18 17v-3",key:"1sqioe"}],["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M8 17V5",key:"1wzmnc"}]],S=d("chart-column-decreasing",k);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"10",x2:"10",y1:"15",y2:"9",key:"c1nkhi"}],["line",{x1:"14",x2:"14",y1:"15",y2:"9",key:"h65svq"}]],E=d("circle-pause",T);function h({value:e}){const[t,r]=o.useState(e),[a,c]=o.useState(!1);return o.useEffect(()=>{if(e!==t){c(!0);const n=setTimeout(()=>{r(e),c(!1)},600);return()=>clearTimeout(n)}},[e,t]),s.jsx("div",{className:"perspective w-26 h-30 custom-font",children:s.jsxs("div",{className:`flip-card ${a?"animate-flip":""}`,children:[s.jsx("div",{className:"flip-front",children:a?t:e}),s.jsx("div",{className:"flip-back",children:a?e:t})]})})}function M(e){const t=Math.floor(e/3600),r=Math.floor(e%3600/60);return{hours:t.toString().padStart(2,"0"),minutes:r.toString().padStart(2,"0")}}function A(){const[e,t]=o.useState(0);o.useEffect(()=>{const c=new Date().toISOString().split("T")[0],n=async()=>{const i=await browser.runtime.sendMessage({action:"getTime"});t(i.daily[c]||0)};n();const l=setInterval(n,1e3);return()=>clearInterval(l)},[]);const{hours:r,minutes:a}=M(e);return s.jsxs("div",{className:"text-center mt-4",children:[s.jsx("h2",{className:"text-lg font-bold mb-4",children:"Total Time Spent Today"}),s.jsxs("div",{className:"flex justify-center gap-4",children:[s.jsx(h,{value:r}),s.jsx(h,{value:a})]}),s.jsx("p",{className:"mt-2 text-sm",children:"Hours : Minutes"})]})}function _(){const e=()=>{browser.tabs.create({url:"stats.html"})};return s.jsxs(s.Fragment,{children:[s.jsx(A,{}),s.jsxs("div",{className:"flex justify-between mt-4 gap-2",children:[s.jsx("button",{className:"bg-emerald-950 p-2 rounded-md hover:ring hover:ring-white hover:opacity-80",onClick:e,children:s.jsx(S,{className:"text-amber-50 w-5 h-5"})}),s.jsx("button",{className:"bg-gray-700 p-2 rounded-md hover:ring hover:ring-white hover:opacity-80",children:s.jsx(C,{className:"text-white w-5 h-5"})}),s.jsx("button",{className:"bg-blue-700 p-2 rounded-md hover:ring hover:ring-white hover:opacity-80",children:s.jsx(E,{className:"text-white w-5 h-5"})})]})]})}y.createRoot(document.getElementById("root")).render(s.jsx(o.StrictMode,{children:s.jsx(_,{})}));
