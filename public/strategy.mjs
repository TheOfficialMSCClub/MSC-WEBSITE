// A small, optional exercise: controls change the annotated drawing and its notes.
// The first explanation and full diagram remain available without JavaScript.
const table=document.querySelector('.thinking-table');
if(table){
 const stages=[
  {label:'Frame the question',title:'What makes an event worth attending?',copy:'Start with who it is for and what they should take away. A clear question gives the discussion a direction.',prompt:'Ask: What problem are we actually trying to solve?'},
  {label:'Connect the evidence',title:'What do we know, and what is missing?',copy:'Audience needs, available time, and budget affect each other. Compare what you know before committing to a format.',prompt:'Ask: Which assumption would change our answer?'},
  {label:'Choose a direction',title:'Make the trade-off explicit.',copy:'Choose a format you can deliver well. Test the idea with the people it is for, then use their feedback to revise the next version.',prompt:'Ask: What are we choosing to leave out?'}
 ];
 const buttons=[...table.querySelectorAll('[data-thinking]')];
 function select(index){
  const stage=stages[index];if(!stage)return;
  table.dataset.thinkingStep=String(index);
  table.querySelector('.thinking-note-index').textContent=String(index+1).padStart(2,'0');
  table.querySelector('.thinking-note-label').textContent=stage.label;
  table.querySelector('#thinking-note-title').textContent=stage.title;
  table.querySelector('#thinking-note-copy').textContent=stage.copy;
  table.querySelector('#thinking-prompt').textContent=stage.prompt;
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));
  table.querySelector('#thinking-status').textContent=`Stage ${index+1} of 3: ${stage.label}. ${stage.title}`;
 }
 buttons.forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.thinking))));
 table.querySelector('.thinking-controls').hidden=false;
}
