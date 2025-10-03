window.addEventListener('DOMContentLoaded', () => {
  // SHA-256 helper
  async function hashHex(str){
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // initial data safe-load
  let users = {};
  let feedbacks = [];
  try { users = JSON.parse(localStorage.getItem('users')) || {}; }
  catch(e){ users = {}; }
  try { feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || []; }
  catch(e){ feedbacks = []; }

  // create defaults if empty
  if(Object.keys(users).length === 0){
    users = {
      "a.abbygail": {nom:"ALBRECHT", prenom:"Abbygaïl", passHash:null, delegate:false},
      "f.baptiste": {nom:"FREY-SAYARATH", prenom:"Baptiste", passHash:null, delegate:false},
      "b.louise": {nom:"BERNHARD", prenom:"Louise", passHash:null, delegate:false},
      "b.paul-alexandre": {nom:"BOULIVAN", prenom:"Paul-Alexandre", passHash:"35f20adae58723e5998d4c2d6d1789d530838ea1e8d193bc9df3af9a896f117e", delegate:true},
      "g.clémentine2": {nom:"GRANVEAUX SUTTER", prenom:"Clémentine", passHash:null, delegate:false},
      "c.lou": {nom:"CRAND", prenom:"Lou", passHash:null, delegate:false},
      "c.elsa": {nom:"COFFINET", prenom:"Elsa", passHash:null, delegate:false},
      "f.noé": {nom:"FAGET", prenom:"Noé", passHash:null, delegate:false},
      "g.cassie": {nom:"GUILLEMAIN", prenom:"Cassie", passHash:null, delegate:false},
      "g.timéo": {nom:"GOLDSCHMIDT", prenom:"Timéo", passHash:null, delegate:false},
      "h.zoé": {nom:"HORLACHER", prenom:"Zoé", passHash:null, delegate:false},
      "j.tinus": {nom:"JONAS", prenom:"Tinus", passHash:null, delegate:false},
      "k.faustine": {nom:"KAUFFMANN", prenom:"Faustine", passHash:null, delegate:false},
      "l.julie": {nom:"LIBIS", prenom:"Julie", passHash:null, delegate:false},
      "b.louis": {nom:"BRUCHON", prenom:"Louis", passHash:null, delegate:false},
      "w.léa": {nom:"WOLF LUX", prenom:"Léa", passHash:null, delegate:false},
      "m.martin": {nom:"MEYER", prenom:"Martin", passHash:null, delegate:false},
      "s.amandine": {nom:"SIMON", prenom:"Amandine", passHash:null, delegate:false},
      "s.matthias": {nom:"STOELBEN", prenom:"Matthias", passHash:null, delegate:false},
      "v.hermione": {nom:"VIOL", prenom:"Hermione", passHash:null, delegate:false},
      "w.clémentine": {nom:"WALTER", prenom:"Clémentine", passHash:null, delegate:true}
    };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('feedbacks', JSON.stringify([]));
  }

  // DOM elements
  const authCard = document.getElementById('auth-card');
  const userArea = document.getElementById('user-area');
  const welcome = document.getElementById('welcome');
  const delegateBadge = document.getElementById('delegate-badge');
  const loginMsg = document.getElementById('login-msg');
  const registerMsg = document.getElementById('register-msg');
  const saveMsg = document.getElementById('save-msg');

  const topActions = document.getElementById('top-actions');
  const navClasse = document.getElementById('nav-classe');
  const navGestion = document.getElementById('nav-gestion');
  const logoutBtn = document.getElementById('logout-btn');

  const classePanel = document.getElementById('classe-panel');
  const gestionPanel = document.getElementById('gestion-panel');

  const allIdeas = document.getElementById('allIdeas');
  const allProblems = document.getElementById('allProblems');
  const allComplaints = document.getElementById('allComplaints');

  const usersList = document.getElementById('users-list');

  let currentUser = null;
  let isDelegateAuthorized = false;
  let isSuperAdmin = false;

  function saveAll(){
    try{ localStorage.setItem('users', JSON.stringify(users)); }
    catch(e){ console.error(e); }
    try{ localStorage.setItem('feedbacks', JSON.stringify(feedbacks)); }
    catch(e){ console.error(e); }
  }

  // helpers
  function generateID(prenom, nom){
    return nom.trim()[0].toLowerCase() + "." + prenom.trim().toLowerCase();
  }
  function escapeHtml(t){ return String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Register
  window.btnRegister = document.getElementById('btn-register');
  document.getElementById('btn-register').addEventListener('click', async ()=>{
    const nom = document.getElementById('register-nom').value.trim();
    const prenom = document.getElementById('register-prenom').value.trim();
    const pass = document.getElementById('register-pass').value;
    const pass2 = document.getElementById('register-pass2').value;
    registerMsg.textContent = '';
    if(!nom || !prenom || !pass || !pass2){ registerMsg.textContent = 'Remplis tous les champs.'; return; }
    if(pass !== pass2){ registerMsg.textContent = 'Les mots de passe diffèrent.'; return; }
    const id = generateID(prenom, nom);
    if(!users[id]){ registerMsg.textContent = `Identifiant non reconnu (${id}). Demande au prof.`; return; }
    if(users[id].passHash){ registerMsg.textContent = `Compte déjà créé pour ${id}.`; return; }
    users[id].passHash = await hashHex(pass);
    saveAll();
    registerMsg.style.color = 'green';
    registerMsg.textContent = `Compte créé ✅ Identifiant : ${id}`;
    setTimeout(()=>{ registerMsg.textContent=''; registerMsg.style.color=''; },4000);
  });

  // Login
  document.getElementById('btn-login').addEventListener('click', async ()=>{
    loginMsg.textContent = '';
    const id = document.getElementById('login-id').value.trim();
    const pass = document.getElementById('login-pass').value;
    if(!id || !pass){ loginMsg.textContent = 'Remplis tous les champs.'; return; }
    const u = users[id];
    if(!u || !u.passHash){ loginMsg.textContent = 'Compte non créé ou identifiant invalide.'; return; }
    const h = await hashHex(pass);
    if(h !== u.passHash){ loginMsg.textContent = 'Identifiant ou mot de passe incorrect.'; return; }

    // ok
    currentUser = id;
    localStorage.setItem('currentUser', id);
    isSuperAdmin = (id === 'b.paul-alexandre');
    if(u.delegate){
      const code = prompt('Compte délégué détecté — entre le code de délégation :');
      if(code === 'LaclasseDe2A'){ isDelegateAuthorized = true; localStorage.setItem('delegate','true'); }
      else { isDelegateAuthorized = false; localStorage.removeItem('delegate'); alert('Code délégué incorrect.'); }
    } else {
      isDelegateAuthorized = false;
      localStorage.removeItem('delegate');
    }
    openUserArea();
  });

  // Open user area after login
  function openUserArea(){
    authCard.style.display = 'none';
    userArea.style.display = 'block';
    topActions.style.display = 'block';
    welcome.textContent = `${users[currentUser].prenom} ${users[currentUser].nom} (${currentUser})`;
    delegateBadge.style.display = users[currentUser].delegate ? 'inline-block' : 'none';
    // show gestion for super admin
    navGestion.style.display = isSuperAdmin ? 'inline-block' : 'none';
    // default view
    showClasse();
    // load panels if allowed
    if(users[currentUser].delegate && isDelegateAuthorized || isSuperAdmin){
      loadAllEntries();
      renderUsersList();
    }
  }

  // logout
  logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('currentUser'); localStorage.removeItem('delegate');
    location.reload();
  });

  // save feedback
  document.getElementById('btn-save').addEventListener('click', ()=>{
    saveMsg.textContent = '';
    if(!currentUser){ saveMsg.textContent = 'Tu dois être connecté.'; return; }
    const idea = document.getElementById('idea').value.trim();
    const problem = document.getElementById('problem').value.trim();
    const complaint = document.getElementById('complaint').value.trim();
    if(!idea && !problem && !complaint){ saveMsg.textContent = 'Écris au moins un champ.'; return; }
    feedbacks.push({ user: currentUser, idea, problem, complaint, time: Date.now() });
    saveAll();
    saveMsg.style.color='green'; saveMsg.textContent='Enregistré ✅';
    setTimeout(()=>{ saveMsg.textContent=''; saveMsg.style.color=''; },2500);
    document.getElementById('idea').value=''; document.getElementById('problem').value=''; document.getElementById('complaint').value='';
    if(users[currentUser].delegate && isDelegateAuthorized || isSuperAdmin) loadAllEntries();
  });

  // show classe panel
  navClasse.addEventListener('click', showClasse);
  function showClasse(){
    classePanel.style.display = 'block';
    gestionPanel.style.display = 'none';
    // if not delegate, hide class panel and show user panel only
    if(users[currentUser] && (users[currentUser].delegate && isDelegateAuthorized || isSuperAdmin)){
      classePanel.style.display = 'block';
    } else {
      classePanel.style.display = 'none';
    }
  }

  // show gestion
  navGestion.addEventListener('click', ()=>{
    classePanel.style.display = 'none';
    gestionPanel.style.display = 'block';
  });

  // load all entries for delegates
  function loadAllEntries(){
    allIdeas.innerHTML = '';
    allProblems.innerHTML = '';
    allComplaints.innerHTML = '';
    feedbacks.slice().reverse().forEach(f=>{
      if(f.idea) allIdeas.insertAdjacentHTML('beforeend', `<div class="panel-item"><div class="meta"><strong>${escapeHtml(f.user)}</strong> • ${new Date(f.time).toLocaleString()}</div><div>${escapeHtml(f.idea)}</div></div>`);
      if(f.problem) allProblems.insertAdjacentHTML('beforeend', `<div class="panel-item"><div class="meta"><strong>${escapeHtml(f.user)}</strong> • ${new Date(f.time).toLocaleString()}</div><div>${escapeHtml(f.problem)}</div></div>`);
      if(f.complaint) allComplaints.insertAdjacentHTML('beforeend', `<div class="panel-item"><div class="meta"><strong>${escapeHtml(f.user)}</strong> • ${new Date(f.time).toLocaleString()}</div><div>${escapeHtml(f.complaint)}</div></div>`);
    });
  }

  // render users list for super admin
  function renderUsersList(){
    usersList.innerHTML = '';
    Object.keys(users).sort().forEach(id=>{
      const u = users[id];
      const el = document.createElement('div');
      el.className = 'user-row';
      el.innerHTML = `<div class="info"><div class="id">${escapeHtml(id)}</div><div class="small-muted">${escapeHtml(u.prenom)} ${escapeHtml(u.nom)} ${u.delegate? '• Délégué':''}</div></div>
        <div class="actions">
          <button data-id="${escapeHtml(id)}" class="reset-btn">Réinitialiser</button>
        </div>`;
      usersList.appendChild(el);
    });
    // attach handlers
    document.querySelectorAll('.reset-btn').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = e.currentTarget.dataset.id;
        if(!confirm(`Réinitialiser le mot de passe de ${id} ?`)) return;
        const temp = Math.random().toString(36).slice(-8) + "A1"; // temp pw
        users[id].passHash = await hashHex(temp);
        saveAll();
        alert(`Mot de passe de ${id} réinitialisé → temporaire : ${temp}`);
      });
    });
  }

  // If already logged in (persist)
  try{
    const u = localStorage.getItem('currentUser');
    const delegateFlag = localStorage.getItem('delegate');
    if(u && users[u] && users[u].passHash){
      currentUser = u;
      isDelegateAuthorized = (delegateFlag === 'true');
      isSuperAdmin = (u === 'b.paul-alexandre');
      openUserArea();
    }
  }catch(e){ console.error(e); }

});
