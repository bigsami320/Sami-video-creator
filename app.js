const $=id=>document.getElementById(id);
let scenes=[],active=0;
$("audio").onchange=()=>$("audioName").textContent=$("audio").files[0]?.name||"No audio selected";
function split(t){t=t.replace(/\s+/g," ").trim();if(!t)return[];let a=t.split(/(?<=[.!?])\s+/).filter(Boolean);if(a.length===1)a=t.match(/.{1,130}(?:\s|$)/g)||[t];return a.slice(0,12)}
function show(i){active=i;document.querySelectorAll(".scene").forEach((x,n)=>x.style.display=n===i?"flex":"none");document.querySelectorAll(".clip").forEach((x,n)=>x.classList.toggle("active",n===i))}
function wrapText(ctx,text,maxWidth){const words=text.split(" "),lines=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);return lines}
function drawScene(ctx,text,index,total,time,width,height){
  ctx.clearRect(0,0,width,height);
  const g=ctx.createLinearGradient(0,0,width,height);g.addColorStop(0,"#080d18");g.addColorStop(1,"#10172a");ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
  const x=width*.82,y=height*.22,r=Math.min(width,height)*.18;
  const glow=ctx.createRadialGradient(x+Math.sin(time/700)*25,y+Math.cos(time/900)*20,5,x,y,r);glow.addColorStop(0,"rgba(135,150,255,.35)");glow.addColorStop(1,"rgba(135,150,255,0)");ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  ctx.fillStyle="#95a5ff";ctx.font=`800 ${Math.max(18,width*.012)}px system-ui,sans-serif`;ctx.letterSpacing="3px";ctx.fillText(`SCENE ${index+1} · ${$("style").value.toUpperCase()}`,width*.08,height*.18);
  ctx.letterSpacing="0";ctx.fillStyle="#f7f8fb";ctx.font=`800 ${Math.max(34,width*.045)}px system-ui,sans-serif`;
  const lines=wrapText(ctx,text,width*.72),lineHeight=Math.max(42,width*.055),startY=height*.48-(lines.length-1)*lineHeight/2;
  lines.forEach((line,i)=>ctx.fillText(line,width*.08,startY+i*lineHeight));
  ctx.fillStyle="#8b9aff";ctx.fillRect(width*.08,height*.9,width*.84*(index+1)/total,8);
}
function pickMime(){const types=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];return types.find(t=>MediaRecorder.isTypeSupported(t))||""}
async function generateVideo(){
  if(!scenes.length)return;
  if(!window.MediaRecorder){$("msg").textContent="Is browser mein video recording support nahi hai.";return}
  const button=$("videoButton");button.disabled=true;button.textContent="GENERATING VIDEO...";$("msg").textContent="Video browser mein generate ho rahi hai...";
  const canvas=document.createElement("canvas"),vertical=$("ratio").value==="9/16";canvas.width=vertical?720:1280;canvas.height=vertical?1280:720;
  const ctx=canvas.getContext("2d");const stream=canvas.captureStream(30),mime=pickMime();
  if(!mime){button.disabled=false;button.textContent="GENERATE VIDEO";$("msg").textContent="Video format is browser mein supported nahi hai.";return}
  const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000}),chunks=[];recorder.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const done=new Promise(resolve=>recorder.onstop=resolve);recorder.start();
  const sceneMs=3000;
  for(let i=0;i<scenes.length;i++){const started=performance.now();while(performance.now()-started<sceneMs){drawScene(ctx,scenes[i],i,scenes.length,performance.now()-started,canvas.width,canvas.height);await new Promise(r=>requestAnimationFrame(r))}}
  recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());
  const blob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="sami-motion-video.webm";a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  button.disabled=false;button.textContent="GENERATE VIDEO";$("msg").textContent="Video ready! Download start ho gaya hai.";
}
$("generate").onclick=()=>{scenes=split($("script").value);if(!scenes.length){$("msg").textContent="Pehle script paste karo.";return}active=0;$("preview").style.aspectRatio=$("ratio").value;$("preview").innerHTML="";$("timeline").innerHTML="";scenes.forEach((text,i)=>{let s=document.createElement("div");s.className="scene";s.style.display=i?"none":"flex";s.innerHTML='<div class="orb"></div><small>SCENE '+(i+1)+" · "+$("style").value.toUpperCase()+'</small><h3></h3>';s.querySelector("h3").textContent=text;$("preview").appendChild(s);let c=document.createElement("div");c.className="clip"+(!i?" active":"");c.onclick=()=>show(i);$("timeline").appendChild(c)});$("count").textContent=scenes.length+" scenes";$("msg").textContent="Scene preview ready. Ab Generate Video dabao.";let old=$("videoButton");if(old)old.remove();const b=document.createElement("button");b.id="videoButton";b.textContent="GENERATE VIDEO";b.onclick=generateVideo;$("timeline").after(b)};
