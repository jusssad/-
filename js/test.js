
const TEST="dbms";

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

const defaultState={
  order: shuffle(QUESTIONS.map(q=>q.id)),
  current:0,
  answers:{}
};

let state=loadProgress(TEST)||structuredClone(defaultState);

const nav=document.getElementById("nav");
const content=document.getElementById("content");
const actions=document.getElementById("actions");

function renderNav(){
  nav.innerHTML="";
  state.order.forEach((id,i)=>{
    const b=document.createElement("button");
    b.textContent=i+1;
    if(state.answers[id]) b.classList.add("answered");
    b.onclick=()=>{state.current=i;render()};
    nav.appendChild(b);
  });
}

function renderQuestion(){
  const q=QUESTIONS.find(x=>x.id===state.order[state.current]);
  const a=state.answers[q.id]||{};
  state.answers[q.id]=a;

  if(!a.qText) a.qText=q.question[Math.floor(Math.random()*q.question.length)];
  if(!a.order){
    a.order=shuffle(q.options.map((_,i)=>i));
  }

  const locked=a.checked;

  content.innerHTML=`
  <div class="card-box">
    <div class="question">${a.qText}</div>
    <div class="options">
      ${a.order.map((opt,i)=>`
        <div class="option
          ${locked?'locked':''}
          ${a.choice===i?'selected':''}
          ${locked && opt===q.correct?'correct':''}
          ${locked && a.choice===i && opt!==q.correct?'wrong':''}"
          onclick="${locked?'':`answer(${i})`}">
          ${q.options[opt]}
        </div>
      `).join("")}
    </div>
    ${locked?`<div class="explanation">${q.explanation}</div>`:''}
  </div>`;
}

function renderActions(){
  const qid=state.order[state.current];
  const a=state.answers[qid];
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
  const qid=state.order[state.current];
  state.answers[qid].choice=i;
  render();
}

function check(){
  const qid=state.order[state.current];
  if(state.answers[qid]){
    state.answers[qid].checked=true;
    render();
  }
}

function finish(){
  let score=0,detailed={};
  state.order.forEach(id=>{
    const q=QUESTIONS.find(x=>x.id===id);
    const a=state.answers[id];
    if(!a) detailed[id]={skipped:true};
    else{
      const real=a.order[a.choice];
      const ok=real===q.correct;
      if(ok) score++;
      detailed[id]={choice:a.choice,correct:ok};
    }
  });
  const id=crypto.randomUUID();
  saveAttempt(TEST,{id,date:Date.now(),score,total:state.order.length,detailed});
  clearProgress(TEST);
  location.href=`results.html?id=${id}`;
}

function exitMenu(){
  saveProgress(TEST,state);
  location.href='../../index.html';
}

render();

