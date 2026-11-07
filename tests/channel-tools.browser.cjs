/* Optional local QA: Node 22+ (native WebSocket) and installed Chromium. No installs or public deployment. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {spawn} = require('node:child_process');
const {once} = require('node:events');

(async()=>{
  const dir=fs.realpathSync(process.argv[2]);
  const serveOnly=process.argv.includes('--serve-only');
  const out=path.resolve(process.argv[3]||'screenshots');if(!serveOnly)fs.mkdirSync(out,{recursive:true});
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.ico':'image/x-icon'};
  const server=http.createServer((req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
    try {
      const relative=decodeURIComponent(new URL(req.url,'http://local').pathname);
      let file=path.resolve(dir,'.'+relative);
      if(!file.startsWith(dir+path.sep)&&file!==dir)throw Error('outside root');
      if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) {
        if(fs.existsSync(path.join(file,'index.html')))file=path.join(file,'index.html');
        else if(fs.existsSync(file+'.html'))file+='.html';
        else throw Error('No index');
      } else if(!fs.existsSync(file)&&fs.existsSync(file+'.html'))file+='.html';
      file=fs.realpathSync(file);if(!file.startsWith(dir+path.sep))throw Error('outside root');
      res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
    }catch {res.writeHead(404);res.end('Not found');}
  });
  server.listen(0,'127.0.0.1');await once(server,'listening');const origin='http://127.0.0.1:'+server.address().port;
  if(serveOnly){console.log(`Local review only: ${origin}/en/yag-channel-tools/\nPiston Atlas: ${origin}/en/piston-atlas-publishing/\nStop with Ctrl+C. No public deployment.`);return;}
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'stemly-tools-chrome-'));
  const chrome=spawn(process.env.CHROME_BINARY||'chromium',['--headless=new','--no-sandbox','--disable-background-networking','--disable-sync','--disable-extensions','--no-first-run','--no-proxy-server','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile],{stdio:['ignore','ignore','pipe']});
  let ws;const pending=new Map();let n=0;const checks=[],events=[];let blocked=0;let session;
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++n;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,...(session?{sessionId:session}:{})}));});
  const ev=async(expression)=>{const r=await cmd('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const check=async(name,expression)=>{const pass=Boolean(await ev(expression));checks.push({name,pass});if(!pass)throw Error(name);};
  const pause=ms=>new Promise(r=>setTimeout(r,ms));
  const navigate=async p=>{await cmd('Page.navigate',{url:origin+p});for(let i=0;i<40;i++){await pause(50);if(await ev('document.readyState==="complete"&&Boolean(document.querySelector("article"))'))break;}await pause(100);};
  try {
    const address=await new Promise((resolve,reject)=>{let text='';chrome.stderr.on('data',d=>{text+=d;const m=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m)resolve(m[1]);});chrome.once('error',reject);chrome.once('exit',code=>reject(Error('Chrome exited '+code)));});
    ws=new WebSocket(address);await once(ws,'open');
    ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else{
      events.push(m);
      if(m.method==='Fetch.requestPaused'){
        if(m.params.request.url.startsWith(origin+'/'))cmd('Fetch.continueRequest',{requestId:m.params.requestId}).catch(()=>{});
        else {blocked++;cmd('Fetch.failRequest',{requestId:m.params.requestId,errorReason:'BlockedByClient'}).catch(()=>{});}
      }
    }});
    const t=await cmd('Target.createTarget',{url:'about:blank'});const a=await cmd('Target.attachToTarget',{targetId:t.targetId,flatten:true});session=a.sessionId;
    await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Network.enable');await cmd('Fetch.enable',{patterns:[{urlPattern:'*'}]});
    for(const [width,height] of [[1440,900],[390,844]]){
      await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      for(const lang of ['en','ko'])for(const app of ['yag-channel-tools','piston-atlas-publishing'])for(const kind of ['overview','privacy','terms']){
        const url=`/${lang}/${app}/${kind==='overview'?'':kind+'/'}`;await navigate(url);
        await check(`${width} ${url} hydrated correct language and title`,`document.querySelector('.tool-shell').lang===${JSON.stringify(lang)}&&document.title.includes(${JSON.stringify(app==='yag-channel-tools'?'YAG Channel Tools':'Piston Atlas Publishing')})`);
        await check(`${width} ${url} readable, one article, no overflow`,`document.querySelectorAll('article').length===1&&document.querySelector('article').textContent.length>500&&document.documentElement.scrollWidth<=innerWidth&&Array.from(document.querySelectorAll('.tool-content h1,.tool-content p,.tool-content li')).every(e=>e.getBoundingClientRect().right<=innerWidth+1&&e.getBoundingClientRect().left>=-1)`);
        await check(`${width} ${url} policy navigation and canonical`,`document.querySelectorAll('.document-nav a').length===3&&document.querySelector('.document-nav a[aria-current="page"]').pathname===${JSON.stringify(url)}&&document.querySelector('link[rel="canonical"]').href===${JSON.stringify('https://stemly.me'+url)}`);
        await check(`${width} ${url} 44px tabs and support`,`Array.from(document.querySelectorAll('.document-nav a')).every(e=>e.getBoundingClientRect().height>=44)&&Boolean(document.querySelector('a[href="mailto:stemly.corp@gmail.com"]'))`);
        if(kind==='privacy')await check(`${width} ${url} actual policies, no invented deletion automation`,`document.querySelector('article').textContent.includes('Limited Use requirements')&&Boolean(document.querySelector('a[href="https://myaccount.google.com/connections"]'))`);
        for(const href of await ev(`Array.from(document.querySelectorAll('a[href^="/"]')).map(a=>a.pathname)`)){
          const res=await fetch(origin+href);if(!res.ok)throw Error('Broken local link '+href);
        }
        const image=await cmd('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,`${app}_${lang}_${kind}_${width}.png`),Buffer.from(image.data,'base64'));
      }
    }
    await navigate('/en/yag-channel-tools/privacy/');
    await ev(`document.querySelector('a[data-lang="ko"]').click()`);await pause(500);
    await check('client-side language switch preserves document and translates content',`location.pathname==='/ko/yag-channel-tools/privacy/'&&document.querySelector('h1').textContent.includes('개인정보처리방침')&&document.querySelector('.primary-nav').textContent.includes('회사 소개')`);
    await ev(`document.querySelector('.document-nav a:last-child').click()`);await pause(300);
    await check('client-side terms navigation',`location.pathname.endsWith('/terms/')&&document.querySelector('h1').textContent.includes('서비스약관')`);
    await ev(`document.querySelector('aside a:last-child').click()`);await pause(300);
    await check('other app navigation uses its real capabilities',`location.pathname==='/ko/piston-atlas-publishing/'&&document.querySelector('article').textContent.includes('즉시 공개나 고정 댓글 자동 게시 기능은 제공하지 않습니다')`);
    await cmd('Page.navigate',{url:origin+'/en/piston-atlas-publishing/'});await pause(300);await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await check('keyboard skip link focus',`document.activeElement.classList.contains('skip')`);
    const ax=await cmd('Accessibility.getFullAXTree');checks.push({name:'browser accessibility tree available',pass:ax.nodes.length>20});
    checks.push({name:'no runtime exceptions',pass:!events.some(e=>e.method==='Runtime.exceptionThrown')});
    checks.push({name:'no local 404 assets',pass:!events.some(e=>e.method==='Network.responseReceived'&&e.params.response.url.startsWith(origin)&&e.params.response.status>=400)});
    fs.writeFileSync(path.join(out,'BROWSER_VALIDATION.json'),JSON.stringify({checks,all_pass:checks.every(c=>c.pass),blocked_external_font_requests:blocked,public_deployment:false,viewports:[[1440,900],[390,844]]},null,2));
    if(checks.some(c=>!c.pass))throw Error('Failed checks');console.log(JSON.stringify({checks:checks.length,pass:true,screenshots:24}));
  }catch(error) {
    const state=ws ? await cmd('Runtime.evaluate',{expression:'JSON.stringify({url:location.href,body:document.body?.innerText})',returnByValue:true}).catch(()=>null) : null;
    fs.writeFileSync(path.join(out,'failure_debug.json'),JSON.stringify({error:String(error),state,events:events.filter(e=>['Network.loadingFailed','Runtime.exceptionThrown','Network.responseReceived'].includes(e.method))},null,2));
    throw error;
  }finally {if(ws)ws.close();chrome.kill();server.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
