const $=s=>document.querySelector(s),COL=["#4f46e5","#0f9d58","#e8710a","#d93025","#0891b2","#a21caf","#65a30d","#be185d","#475569","#ca8a04"];
const SAMPLE=`Aman: DAA, DBMS, OS
Bhavna: DAA, CN, MATHS
Chetan: DBMS, CN, AI
Divya: OS, AI, MATHS
Esha: DAA, AI
Farhan: DBMS, MATHS
Gauri: OS, CN
Harsh: DAA, OS, JAVA
Isha: JAVA, MATHS
Jatin: JAVA, DBMS`;
let R=null;
const tabs=[["dash","Dashboard"],["in","Data & Settings"],["tt","Timetable"],["al","Algorithm Analysis"]];
$("#nav").innerHTML=tabs.map(t=>`<button data-t="${t[0]}">${t[1]}</button>`).join("");
function show(t){document.querySelectorAll(".v").forEach(e=>e.classList.toggle("on",e.id=="v-"+t));document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.t==t));location.hash=t}
$("#nav").onclick=e=>e.target.dataset.t&&show(e.target.dataset.t);
async function run(){const text=$("#data").value;
let d;try{const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:text})});d=await r.json();if(!r.ok){alert(d.error||"Server error");return}}
catch(e){alert("Cannot reach backend. Start it with:  python backend/app.py");return}
R=d;render()}
function slotDates(i,spd){const sd=$("#sd").value?new Date($("#sd").value):new Date();let d=Math.floor(i/spd),dt=new Date(sd);while(dt.getDay()===0)dt.setDate(dt.getDate()+1);while(d>0){dt.setDate(dt.getDate()+1);if(dt.getDay()!==0)d--}
return dt.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})+" · "+["10:00 AM","2:00 PM","5:00 PM"][i%spd]}
function render(){const{g,b}=R,n=g.names.length,spd=+$("#spd").value,m=b.m,slots=[...Array(m)].map(()=>[]);b.c.forEach((c,v)=>slots[c].push(v));
const load=R.load;
const kp=[[n,"Subjects (vertices)"],[g.E.length,"Conflicts (edges)"],[R.students,"Students"],[m,"Exam slots needed"],[Math.ceil(m/spd),"Exam days"],[R.bt.toFixed(2)+" ms","Backtracking time"]];
$("#kpis").innerHTML=kp.map(k=>`<div class="k"><b>${k[0]}</b><span>${k[1]}</span></div>`).join("");
$("#status").innerHTML=R.bad?`<div class="msg bad">✗ ${R.bad} conflicting edges found</div>`:`<div class="msg ok">✓ Valid timetable – no student has two exams in the same slot${R.fb?" (greedy fallback, may not be minimum)":""}.</div>`;
const W=520,H=400,cx=W/2,cy=H/2,r=Math.min(cx,cy)-45,P=g.names.map((_,i)=>[cx+r*Math.cos(2*Math.PI*i/n-Math.PI/2),cy+r*Math.sin(2*Math.PI*i/n-Math.PI/2)]);
$("#graph").innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:320px">${g.E.map(([i,j])=>`<line x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[j][0]}" y2="${P[j][1]}" stroke="#98a0b5" stroke-opacity=".5"/>`).join("")}${P.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="17" fill="${COL[b.c[i]%10]}"/><text x="${p[0]}" y="${p[1]+4}" text-anchor="middle" style="fill:#fff;font-weight:600;font-size:9px">${g.names[i].slice(0,6)}</text>`).join("")}</svg>`;
const mx=Math.max(...slots.map(s=>s.length)),ml=Math.max(...load);
$("#bars").innerHTML=slots.map((s,i)=>`<div class="bar"><em>Slot ${i+1}</em><i style="width:${s.length/mx*70}%;background:${COL[i%10]}"></i>${s.length}</div>`).join("");
$("#load").innerHTML=load.map((l,i)=>`<div class="bar"><em>Slot ${i+1}</em><i style="width:${l/ml*70}%;background:${COL[i%10]}"></i>${l}</div>`).join("");
$("#tt").innerHTML=`<table><tr><th>Slot</th><th>Date &amp; time</th><th>Subjects</th><th>Students</th></tr>${slots.map((s,i)=>`<tr><td><b>${i+1}</b></td><td>${slotDates(i,spd)}</td><td>${s.map(v=>`<span class="chip" style="background:${COL[i%10]}">${g.names[v]} (${g.cnt[v]})</span>`).join("")}</td><td>${load[i]}</td></tr>`).join("")}</table>`;
$("#cmp").innerHTML=`<table><tr><th></th><th>Backtracking</th><th>Greedy</th></tr><tr><th>Slots used</th><td>${m}</td><td>${R.gm}</td></tr><tr><th>Time</th><td>${R.bt.toFixed(2)} ms</td><td>${R.gt.toFixed(2)} ms</td></tr><tr><th>Assignments tried</th><td>${b.steps}</td><td>${n}</td></tr><tr><th>Backtracks</th><td>${b.back}</td><td>0</td></tr><tr><th>Optimal?</th><td>${R.fb?"No":"Yes"}</td><td>${R.gm===m?"Yes (this input)":"No"}</td></tr></table>`;
$("#log").innerHTML=R.log.join("<br>");}
$("#csv").onclick=()=>{if(!R)return;const spd=+$("#spd").value,rows=[["Slot","Date/Time","Subjects"]];const m=R.b.m;for(let i=0;i<m;i++)rows.push([i+1,slotDates(i,spd),R.g.names.filter((_,v)=>R.b.c[v]===i).join(" | ")]);
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(x=>`"${x}"`).join(",")).join("\n")],{type:"text/csv"}));a.download="exam_timetable.csv";a.click()};
$("#gen").onclick=async()=>{await run();show("tt")};$("#rst").onclick=()=>{$("#data").value=SAMPLE;run()};
$("#rnd").onclick=()=>{const S=["DAA","DBMS","OS","CN","AI","MATHS","JAVA","PYTHON","SE","ML","WEB","COA"],L=[];for(let i=1;i<=40;i++){const k=2+Math.floor(Math.random()*3),p=[...S].sort(()=>Math.random()-.5).slice(0,k);L.push(`Student${i}: ${p.join(", ")}`)}$("#data").value=L.join("\n");run()};
$("#sd").value=new Date(Date.now()+864e5*7).toISOString().slice(0,10);$("#spd").onchange=()=>R&&render();$("#sd").onchange=()=>R&&render();
$("#data").value=SAMPLE;run();show(["dash","in","tt","al"].includes(location.hash.slice(1))?location.hash.slice(1):"dash");
