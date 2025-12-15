
const TEST="dbms";
const defaultState={current:0,answers:{}};
let state=loadProgress(TEST)||structuredClone(defaultState);

const nav=document.getElementById("nav");
const content=document.getElementById("content");
const actions=document.getElementById("actions");

function renderNav(){
  nav.innerHTML="";
  QUESTIONS.forEach((q,i)=>{
    const b=document.createElement("button");
    b.textContent=i+1;
    if(state.answers[q.id]) b.classList.add("answered");
    b.onclick=()=>{state.current=i;render()};
    nav.appendChild(b);
  });
}

function renderQuestion(){
  const q=QUESTIONS[state.current];
  const a=state.answers[q.id];
  const locked=a?.checked;
  content.innerHTML=`
  <div class="card-box">
    <div class="question">${q.question[0]}</div>
    <div class="options">
      ${q.options.map((o,i)=>`
      <div class="option
        ${locked?'locked':''}
        ${a?.choice===i?'selected':''}
        ${locked && i===q.correct?'correct':''}
        ${locked && a?.choice===i && i!==q.correct?'wrong':''}"
        onclick="${locked?'':`answer(${i})`}">${o}</div>`).join("")}
    </div>
    ${locked?`<div class="explanation">${q.explanation}</div>`:''}
  </div>`;
}

function renderActions(){
  const q=QUESTIONS[state.current];
  const a=state.answers[q.id];
  actions.innerHTML=`
    <button onclick="check()" ${a?.checked?'disabled':''}>Проверить</button>
    <button class="secondary" onclick="finish()">Завершить тест</button>
    <button class="secondary" onclick="exitMenu()">В меню</button>`;
}

function render(){
  renderNav();renderQuestion();renderActions();
  saveProgress(TEST,state);
}

function answer(i){
  const q=QUESTIONS[state.current];
  state.answers[q.id]={choice:i};
  render();
}

function check(){
  const q=QUESTIONS[state.current];
  if(state.answers[q.id]){state.answers[q.id].checked=true;render();}
}

function finish(){
  let score=0,detailed={};
  QUESTIONS.forEach(q=>{
    const a=state.answers[q.id];
    if(!a) detailed[q.id]={skipped:true};
    else{
      const ok=a.choice===q.correct;if(ok) score++;
      detailed[q.id]={choice:a.choice,correct:ok};
    }
  });
  const id=crypto.randomUUID();
  saveAttempt(TEST,{id,date:Date.now(),score,total:QUESTIONS.length,detailed});
  clearProgress(TEST);
  location.href=`results.html?id=${id}`;
}

function exitMenu(){
  saveProgress(TEST,state);
  location.href='../../index.html';
}

render();
