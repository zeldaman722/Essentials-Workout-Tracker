let DATA=null;
const state={location:'home',week:1,day:'fullBody',draft:{}};
const LS_KEY='homeRetroWorkoutTrackerData_v1';
const loadStore=()=>{try{return JSON.parse(localStorage.getItem(LS_KEY))||{workouts:[],cardio:[]}}catch{return{workouts:[],cardio:[]}}};
const saveStore=s=>localStorage.setItem(LS_KEY,JSON.stringify(s));
const blockForWeek=w=>w<=4?1:w<=8?2:3;
const arrName=(loc,block)=>`${loc==='home'?'home':'retro'}Block${block}`;
const dayLabel=d=>({fullBody:'Full Body',upper:'Upper',lower:'Lower'})[d]||d;
const fmtDate=iso=>new Date(iso).toLocaleString();

function muscleGuess(name){
  const n=name.toLowerCase(); const m=[];
  const add=x=>{if(!m.includes(x))m.push(x)};
  if(/squat|lunge|leg press|leg extension|step-up/.test(n)) add('Quads / glutes');
  if(/rdl|romanian|hamstring|nordic|hyperextension/.test(n)) add('Hamstrings / glutes');
  if(/press|flye|pec deck|dip/.test(n)) add(/shoulder|arnold/.test(n)?'Shoulders':'Chest / triceps');
  if(/row|pulldown|pull-up|pullup|meadows/.test(n)) add('Back / biceps');
  if(/curl/.test(n)) add('Biceps');
  if(/triceps|skull|french/.test(n)) add('Triceps');
  if(/lateral raise/.test(n)) add('Lateral delts');
  if(/calf|toe press/.test(n)) add('Calves');
  if(/crunch|leg raise/.test(n)) add('Abs');
  return m.length?m.join(', '):'Compound / target muscles';
}

function formCues(ex){
  const cues=[];
  if(ex.notes) cues.push(ex.notes);
  const n=ex.name.toLowerCase();
  if(/squat|lunge|split squat/.test(n)){cues.push('Keep your whole foot planted and control the descent.','Drive through the working leg without bouncing.');}
  else if(/rdl|romanian/.test(n)){cues.push('Push the hips back while keeping the spine neutral.','Stop when hamstrings are stretched without rounding your back.');}
  else if(/press/.test(n)){cues.push('Keep shoulder blades controlled against the bench.','Lower smoothly and press without bouncing.');}
  else if(/row/.test(n)){cues.push('Lead with the elbows and avoid shrugging.','Control the lowering phase.');}
  else if(/pull/.test(n)){cues.push('Start from a controlled stretch.','Pull elbows down and avoid swinging.');}
  else if(/curl/.test(n)){cues.push('Keep upper arms steady.','Use a controlled eccentric and avoid momentum.');}
  else if(/lateral raise/.test(n)){cues.push('Raise out to the side with soft elbows.','Stop before momentum takes over.');}
  else if(/crunch|leg raise/.test(n)){cues.push('Move through the abs rather than swinging.','Exhale as you shorten the torso.');}
  return cues.slice(0,3);
}

function previousStats(exId){
  const store=loadStore(); const all=[];
  for(const w of store.workouts){for(const e of w.exercises||[]){if(e.id===exId){for(const s of e.sets||[]){if(s.done)all.push({...s,date:w.date})}}}}
  if(!all.length)return {last:'No previous set',best:'No best yet'};
  all.sort((a,b)=>new Date(b.date)-new Date(a.date));
  const score=s=>(Number(s.weight)||0)*(Number(s.reps)||0);
  const best=[...all].sort((a,b)=>score(b)-score(a))[0];
  const label=s=>`${s.weight||0} lb × ${s.reps||0} reps${s.rpe?` @ RPE ${s.rpe}`:''}`;
  return {last:label(all[0]),best:label(best)};
}

function currentTemplate(){
  const b=blockForWeek(state.week); const arr=DATA.blocks[arrName(state.location,b)]||[];
  return arr.find(w=>w.day===state.day);
}

function ensureDraft(ex){
  if(!state.draft[ex.id]) state.draft[ex.id]=Array.from({length:ex.sets},()=>({weight:'',reps:'',rpe:'',done:false}));
  return state.draft[ex.id];
}

function render(){
  const b=blockForWeek(state.week); const t=currentTemplate();
  document.getElementById('blockSummary').textContent=`Block ${b} • Weeks ${b===1?'1–4':b===2?'5–8':'9–12'} • ${dayLabel(state.day)} • ${state.location==='home'?'Home':'Retro Fitness'}`;
  const list=document.getElementById('exerciseList'); list.innerHTML='';
  if(!t)return;
  t.exercises.forEach((ex,i)=>{
    const d=document.createElement('details'); d.className='exercise'; if(i===0)d.open=true;
    const guide=DATA.guides[ex.id]; const stats=previousStats(ex.id); const sets=ensureDraft(ex);
    const homeEq=state.location==='retro'&&guide?`<div class="home-equivalent">🏠 Home equivalent: <strong>${guide.homeEquivalent}</strong></div>`:'';
    const vids=[];
    if(state.location==='retro'&&guide){
      vids.push(`<a class="video-link" target="_blank" rel="noopener" href="${guide.retroVideoURL}">▶ Retro form</a>`);
      vids.push(`<a class="video-link" target="_blank" rel="noopener" href="${guide.homeVideoURL}">▶ Home form</a>`);
    } else {
      const matchingGuide=Object.values(DATA.guides).find(g=>g.homeEquivalent===ex.name || g.homeEquivalent.replace(/ — (Heavy|Back-Off)$/,'')===ex.name.replace(/ — (Heavy|Back-Off)$/,''));
      if(matchingGuide) vids.push(`<a class="video-link" target="_blank" rel="noopener" href="${matchingGuide.homeVideoURL}">▶ Proper form</a>`);
    }
    const cues=formCues(ex).map(c=>`<li>${c}</li>`).join('');
    d.innerHTML=`
      <summary>
        <div class="exercise-title">${i+1}. ${ex.name}</div>
        <div class="meta">${ex.sets} set${ex.sets>1?'s':''} • ${ex.reps} • RPE ${ex.rpe} • Rest ${ex.rest}</div>
        ${homeEq}
      </summary>
      <div class="exercise-body">
        <div class="details-grid">
          <div class="mini-card"><strong>Muscles worked</strong><span>${muscleGuess(ex.name)}</span></div>
          <div class="mini-card"><strong>Equipment</strong><span>${ex.equipment}</span></div>
          <div class="mini-card"><strong>Last logged</strong><span>${stats.last}</span></div>
          <div class="mini-card"><strong>Best logged</strong><span>${stats.best}</span></div>
        </div>
        ${vids.length?`<div class="video-row">${vids.join('')}</div>`:''}
        ${cues?`<strong>Form cues</strong><ul class="cue-list">${cues}</ul>`:''}
        <table class="set-table"><thead><tr><th>Set</th><th>lb</th><th>Reps</th><th>RPE</th><th>Done</th></tr></thead><tbody>
          ${sets.map((s,si)=>`<tr>
            <td>${si+1}</td>
            <td><input inputmode="decimal" data-ex="${ex.id}" data-set="${si}" data-field="weight" value="${s.weight}"></td>
            <td><input inputmode="numeric" data-ex="${ex.id}" data-set="${si}" data-field="reps" value="${s.reps}"></td>
            <td><input inputmode="decimal" data-ex="${ex.id}" data-set="${si}" data-field="rpe" value="${s.rpe}"></td>
            <td><input type="checkbox" data-ex="${ex.id}" data-set="${si}" data-field="done" ${s.done?'checked':''}></td>
          </tr>`).join('')}
        </tbody></table>
      </div>`;
    list.appendChild(d);
  });
  bindSetInputs(); updateProgress();
}

function bindSetInputs(){
  document.querySelectorAll('[data-ex][data-set]').forEach(el=>el.addEventListener('input',e=>{
    const {ex,set,field}=e.target.dataset; const i=Number(set); state.draft[ex][i][field]=field==='done'?e.target.checked:e.target.value; updateProgress();
  }));
  document.querySelectorAll('input[type=checkbox][data-ex]').forEach(el=>el.addEventListener('change',e=>{
    const {ex,set}=e.target.dataset; state.draft[ex][Number(set)].done=e.target.checked; updateProgress();
  }));
}

function updateProgress(){
  const t=currentTemplate(); let total=0,done=0;
  if(t)for(const ex of t.exercises){const sets=ensureDraft(ex);total+=sets.length;done+=sets.filter(s=>s.done).length}
  document.getElementById('progressText').textContent=`${done} / ${total} sets`;
  document.getElementById('progressBar').style.width=`${total?done/total*100:0}%`;
}

function saveWorkout(){
  const t=currentTemplate(); if(!t)return; const store=loadStore();
  store.workouts.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:new Date().toISOString(),week:state.week,block:blockForWeek(state.week),day:state.day,location:state.location,exercises:t.exercises.map(ex=>({id:ex.id,name:ex.name,sets:ensureDraft(ex)}))});
  saveStore(store); state.draft={}; alert('Workout saved.'); render();
}

function renderHistory(){
  const store=loadStore(); const box=document.getElementById('historyContent');
  if(!store.workouts.length&&!store.cardio.length){box.innerHTML='<p>No workouts logged yet.</p>';return}
  const items=[...store.workouts.map(w=>({type:'Workout',date:w.date,text:`Week ${w.week} • ${dayLabel(w.day)} • ${w.location==='home'?'Home':'Retro Fitness'}`})),...store.cardio.map(c=>({type:'Bike',date:c.date,text:`${c.minutes} min${c.notes?` • ${c.notes}`:''}`}))].sort((a,b)=>new Date(b.date)-new Date(a.date));
  box.innerHTML=items.map(x=>`<div class="history-item"><strong>${x.type}</strong><div>${x.text}</div><small>${fmtDate(x.date)}</small></div>`).join('');
}

async function init(){
  DATA=await fetch('program.json').then(r=>r.json());
  const week=document.getElementById('weekSelect'); for(let i=1;i<=12;i++){const o=document.createElement('option');o.value=i;o.textContent=`Week ${i}`;week.appendChild(o)}
  week.value=state.week;
  week.addEventListener('change',e=>{state.week=Number(e.target.value);state.draft={};render()});
  document.getElementById('daySelect').addEventListener('change',e=>{state.day=e.target.value;state.draft={};render()});
  document.querySelectorAll('#locationToggle button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#locationToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.location=b.dataset.location;state.draft={};render()}));
  document.getElementById('saveWorkoutBtn').addEventListener('click',saveWorkout);
  document.getElementById('historyBtn').addEventListener('click',()=>{renderHistory();document.getElementById('historyDialog').showModal()});
  document.getElementById('cardioBtn').addEventListener('click',()=>document.getElementById('cardioDialog').showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
  document.getElementById('saveCardioBtn').addEventListener('click',()=>{const s=loadStore();s.cardio.unshift({date:new Date().toISOString(),minutes:Number(document.getElementById('cardioMinutes').value)||0,notes:document.getElementById('cardioNotes').value});saveStore(s);document.getElementById('cardioDialog').close();alert('Bike cardio saved.');});
  document.getElementById('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(loadStore(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='workout-tracker-backup.json';a.click();URL.revokeObjectURL(a.href)});
  document.getElementById('importInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());saveStore(d);alert('Data imported.');render()}catch{alert('Could not import that file.')}});
  let deferredPrompt; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBtn').classList.remove('hidden')});
  document.getElementById('installBtn').addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null}});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  render();
}
init();
