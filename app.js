const key='yousef-study-v2';
let activeFilter='all';
let activeSubject='Physics';
let state={read:[],attempts:[]};
try {
 const saved=JSON.parse(localStorage.getItem(key));
 if(saved&&Array.isArray(saved.read)&&Array.isArray(saved.attempts))state=saved;
 else {const old=JSON.parse(localStorage.getItem('yousef-study-v1'));if(old&&Array.isArray(old.read))state.read=old.read;}
} catch {}
const $=s=>document.querySelector(s);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{$('#storage-note').textContent='Storage is unavailable. Your progress will last for this session only.';}stats();}
function stats(){
 $('#read-count').textContent=state.read.filter(id=>lessons.some(l=>l.id===id)).length;
 $('#attempt-count').textContent=state.attempts.length;
 $('#best-score').textContent=state.attempts.length?Math.max(...state.attempts.map(a=>Number(a.percent)||0))+'%':'—';
}
function cards(){
 const query=$('#search').value.trim().toLowerCase();
 const filtered=lessons
  .filter(l=>(l.subject||'Physics')===activeSubject&&(activeFilter==='all'||(l.levels||[]).includes(activeFilter))&&[l.title,l.intro,...l.sections.map(s=>s.text),...l.examples.map(e=>e.q)].join(' ').toLowerCase().includes(query))
  .sort((a,b)=>Number(a.topic.slice(0,2))-Number(b.topic.slice(0,2)));
 $('#cards').innerHTML=filtered.map(l=>`<article class="card"><div class="level-row">${(l.levels||['Core']).map(level=>`<span class="level ${level.toLowerCase()}">${level}</span>`).join('')}</div><span class="number">${l.topic.slice(0,2)}</span><small>${l.topic.slice(5)} · ${l.minutes} min</small><h3>${l.title}</h3><p>${l.intro}</p><small>${l.examples.length} worked examples · ${l.questions.length} practice questions</small><button data-id="${l.id}">${state.read.includes(l.id)?'Review lesson':'Open lesson'} →</button></article>`).join('');
 $('#empty').hidden=filtered.length>0;
}
function numberCorrect(value,q){const text=String(value??'').trim();return text!==''&&Number.isFinite(Number(text))&&Math.abs(Number(text)-q.answer)<=q.tolerance+Number.EPSILON*Math.max(1,Math.abs(q.answer));}
function questionHTML(q,i){
 const legend=`<legend><span class="question-type">${q.type==='choice'?'Multiple choice':q.type==='number'?'Calculation · 1 point':'Explain · self-assessed'}</span>${i+1}. ${escapeHTML(q.q)}</legend>`;
 let field;
 if(q.type==='choice')field=q.options.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}" required>${escapeHTML(o)}</label>`).join('');
 else if(q.type==='number')field=`<label class="numeric-label">Answer in ${escapeHTML(q.unit)}<input name="q${i}" type="number" step="any" required aria-describedby="hint-${i}"></label><small id="hint-${i}">Enter the number only; the unit is shown above. Scientific notation such as 6e8 is accepted. Tolerance: ±${q.tolerance} ${escapeHTML(q.unit)}.</small>`;
 else field=`<label>Your explanation<textarea name="q${i}" rows="3" required placeholder="Write your reasoning before viewing the model points."></textarea></label>`;
 return `<fieldset class="question">${legend}${field}<div id="feedback-${i}" aria-live="polite"></div></fieldset>`;
}
function openLesson(id){
 const l=lessons.find(item=>item.id===id);if(!l)return;
 const panel=$('#lesson');panel.hidden=false;
 const autoCount=l.questions.filter(q=>q.type!=='explain').length, writtenCount=l.questions.length-autoCount;
 panel.innerHTML=`<div class="lesson-heading"><div><p class="eyebrow">${l.topic} · ${l.minutes} min</p><div class="level-row">${(l.levels||['Core']).map(level=>`<span class="level ${level.toLowerCase()}">${level}</span>`).join('')}</div><h2 id="lesson-title" tabindex="-1">${l.title}</h2></div><a href="#library">All lessons ↑</a></div><p>${l.intro}</p><div class="objectives"><h3>By the end, you should be able to…</h3><ul>${l.objectives.map(o=>`<li>${o}</li>`).join('')}</ul></div><nav class="lesson-nav" aria-label="Lesson sections"><a href="#understand">Understand</a><a href="#formulas">Formula guide</a><a href="#examples">Worked examples</a><a href="#practice">Practice</a></nav><section id="understand"><h3 class="block-title">Understand the ideas</h3>${l.sections.map((s,i)=>`<article class="explanation"><h4>${i+1}. ${s.title}</h4><p>${s.text}</p><p class="callout"><strong>Remember:</strong> ${s.check}</p></article>`).join('')}</section><section id="formulas"><h3 class="block-title">Formula & unit guide</h3><div class="table-wrap"><table><thead><tr><th scope="col">Quantity</th><th scope="col">Relationship</th><th scope="col">Unit</th></tr></thead><tbody>${l.formulas.map(f=>`<tr>${f.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section><section id="examples"><h3 class="block-title">${l.examples.length} worked examples</h3><p>Try each question first, then compare your method with the steps.</p>${l.examples.map((e,i)=>`<article class="worked-example"><span class="eyebrow">Example ${i+1}</span><h4>${e.title}</h4><p>${e.q}</p><details><summary>Show step-by-step solution</summary><ol>${e.steps.map(step=>`<li>${step}</li>`).join('')}</ol><p class="answer"><strong>Answer:</strong> ${e.answer}</p><p><strong>Why this method?</strong> ${e.why}</p></details></article>`).join('')}</section><button id="mark-read">${state.read.includes(id)?'✓ Reading completed':'Mark reading complete'}</button><section id="practice"><h3 class="block-title">Practice: recall, calculate, explain</h3><p>Original practice, not official exam questions. ${autoCount} items are automatically marked; ${writtenCount} explanation ${writtenCount===1?'is':'are'} self-assessed against model points.</p><form id="quiz">${l.questions.map(questionHTML).join('')}<button type="submit">Check answers & show explanations</button><div id="result" role="status" tabindex="-1"></div><button id="retry" type="button" hidden>Try this lesson again</button></form></section>`;
 $('#mark-read').onclick=e=>{if(!state.read.includes(id))state.read.push(id);save();cards();e.target.textContent='✓ Reading completed';};
 $('#retry').onclick=()=>{openLesson(id);$('#practice').scrollIntoView({behavior:'smooth'});};
 let recorded=false;
 $('#quiz').onsubmit=e=>{
  e.preventDefault();if(recorded)return;
  const form=new FormData(e.currentTarget);let score=0;const auto=l.questions.filter(q=>q.type!=='explain').length;
  l.questions.forEach((q,i)=>{
   const feedback=$('#feedback-'+i);
   if(q.type==='explain'){
    feedback.className='feedback self-assessment';
    feedback.innerHTML=`<strong>Model answer points — self-assessment</strong><p>Compare your own wording with these ideas. Tick only the points you explained. These checks do not change your automatic score.</p>${q.points.map(point=>`<label><input class="model-check" type="checkbox">${escapeHTML(point)}</label>`).join('')}`;
   }else{
    const correct=q.type==='number'?numberCorrect(form.get('q'+i),q):form.get('q'+i)!==null&&Number(form.get('q'+i))===q.answer;
    if(correct)score++;
    feedback.className='feedback'+(correct?'':' wrong');
    feedback.textContent=(correct?'✓ Correct. ':'Review: correct answer is '+(q.type==='number'?q.answer+' '+q.unit:q.options[q.answer])+'. ')+q.why;
   }
  });
  const percent=Math.round(score/auto*100);
  $('#result').textContent=`Automatic score: ${score}/${auto} (${percent}%). Review the explanations below each question, then self-check your two written answers. Numerical marking checks the value in the stated unit; it does not award method marks.`;
  $('#result').className='result-box';
  state.attempts.push({id,score,total:auto,percent,date:new Date().toISOString()});recorded=true;save();
  e.currentTarget.querySelector('button[type=submit]').disabled=true;
  e.currentTarget.querySelectorAll('input:not(.model-check),textarea').forEach(input=>input.disabled=true);
  $('#retry').hidden=false;$('#result').focus();
 };
 panel.scrollIntoView({behavior:'smooth'});$('#lesson-title').focus({preventScroll:true});
}
$('#cards').addEventListener('click',e=>{const button=e.target.closest('button[data-id]');if(button)openLesson(button.dataset.id);});
$('#search').addEventListener('input',cards);stats();cards();
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;document.querySelectorAll('.filter').forEach(item=>item.classList.toggle('active',item===button));cards();}));
const subjectUI={Physics:{code:'Physics · 0625',focus:'Understand the physics.',copy:'English lessons for Core, Extended and practical skills, with worked examples and explained practice.',symbol:'F = ma'},Mathematics:{code:'Mathematics · 0580',focus:'Build mathematical confidence.',copy:'Number, algebra, geometry, trigonometry, probability and statistics with clear worked methods.',symbol:'x² + y²'},'Additional Mathematics':{code:'Additional Mathematics · 0606',focus:'Think like an advanced mathematician.',copy:'The complete 2025–2027 pathway: functions, algebra, geometry, trigonometry, series, vectors and calculus.',symbol:'dy/dx'},Biology:{code:'Biology · 0610',focus:'Connect life processes.',copy:'Cells, organisms, inheritance and ecosystems explained through evidence and practical thinking.',symbol:'DNA'},Chemistry:{code:'Chemistry · 0620',focus:'Explain matter and change.',copy:'Particles, bonding, reactions and organic chemistry with equations and calculation practice.',symbol:'H₂O'}};
function updateSubject(){const ui=subjectUI[activeSubject],current=lessons.filter(l=>(l.subject||'Physics')===activeSubject);$('#subject-code').textContent=ui.code;$('#hero-eyebrow').textContent=`CAMBRIDGE IGCSE ${activeSubject.toUpperCase()} PATHWAY`;$('#hero-focus').textContent=ui.focus;$('#hero-copy').textContent=ui.copy;$('#hero-symbol').textContent=ui.symbol;$('#hero-orbit').innerHTML=`${activeSubject.toUpperCase()}<br>IN FOCUS`;$('#library-eyebrow').textContent=`YOUR ${activeSubject.toUpperCase()} LIBRARY`;$('#library-summary').textContent=`${current.length} lessons · ${current.reduce((n,l)=>n+l.examples.length,0)} worked examples · ${current.reduce((n,l)=>n+l.questions.length,0)} practice questions`;$('#search').value='';activeFilter='all';document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));$('#lesson').hidden=true;cards();}
document.querySelectorAll('.subject').forEach(button=>button.addEventListener('click',()=>{activeSubject=button.dataset.subject;document.querySelectorAll('.subject').forEach(item=>item.classList.toggle('active',item===button));updateSubject();}));
updateSubject();
if(typeof navigator!=='undefined'&&'serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
