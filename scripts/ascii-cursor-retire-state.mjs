import fs from 'node:fs';

const file='assets/js/ascii-cursor-glsl-v3.js';
let source=fs.readFileSync(file,'utf8');

if(source.includes('const retireState=()=>')){
  console.log('GLSL cursor retirement already applied.');
  process.exit(0);
}

const replaceOnce=(from,to,label)=>{
  if(!source.includes(from))throw new Error(`Could not patch ${label}`);
  source=source.replace(from,to);
};

replaceOnce(
  "let running=false,activated=false,raf=0,fadeTimer=0,resetTimer=0;",
  "let running=false,activated=false,raf=0,fadeTimer=0,resetTimer=0,retireTimer=0,retiring=false;",
  'retirement state variables'
);

replaceOnce(
  "const stopAndReset=()=>{running=false;cancelAnimationFrame(raf);canvas.style.opacity='0';resetState();};",
  "const stopAndReset=()=>{running=false;cancelAnimationFrame(raf);canvas.style.opacity='0';resetState();retiring=false;};\n  const retireState=()=>{if(retiring)return;retiring=true;pointer.lastMove=-Infinity;clearTimeout(fadeTimer);clearTimeout(resetTimer);clearTimeout(retireTimer);canvas.style.opacity='0';if(!running&&activated)start();retireTimer=setTimeout(()=>{retireTimer=0;stopAndReset();},720);};",
  'retirement reset'
);

replaceOnce(
  "const wakeAt=(clientX,clientY,strength=1)=>{if(reduce.matches)return;const cx=Number(clientX),cy=Number(clientY);",
  "const wakeAt=(clientX,clientY,strength=1)=>{if(reduce.matches)return;if(retiring){clearTimeout(retireTimer);retireTimer=0;stopAndReset();}const cx=Number(clientX),cy=Number(clientY);",
  'fresh wake after fade'
);

replaceOnce(
  "const wakePointer=e=>{if(e.pointerType==='touch')return;wakeAt(e.clientX,e.clientY,1);};",
  "const wakePointer=e=>{if(e.pointerType==='touch'||!document.body.classList.contains('ascii-cursor-engaged'))return;wakeAt(e.clientX,e.clientY,1);};",
  'hidden pointer gate'
);

replaceOnce(
  "document.addEventListener('data-c0re-languagechange',()=>collisionBurst(780));",
  "const engagementObserver=new MutationObserver(()=>{if(document.body.classList.contains('ascii-cursor-engaged')){if(retiring){clearTimeout(retireTimer);retireTimer=0;stopAndReset();}}else if(activated){retireState();}});\n  engagementObserver.observe(document.body,{attributes:true,attributeFilter:['class']});\n  document.addEventListener('data-c0re-languagechange',()=>collisionBurst(780));",
  'engagement observer'
);

fs.writeFileSync(file,source);
console.log('GLSL cursor now retires and resets its simulation state when the interaction fades.');
