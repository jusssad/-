
function loadProgress(test){return JSON.parse(localStorage.getItem("progress_"+test)||"null")}
function saveProgress(test,data){localStorage.setItem("progress_"+test,JSON.stringify(data))}
function clearProgress(test){localStorage.removeItem("progress_"+test)}
function loadAttempts(test){return JSON.parse(localStorage.getItem("attempts_"+test)||"[]")}
function saveAttempt(test,attempt){
  const list=loadAttempts(test);list.push(attempt);
  localStorage.setItem("attempts_"+test,JSON.stringify(list));
}
function getAttempt(test,id){return loadAttempts(test).find(a=>a.id===id)}
