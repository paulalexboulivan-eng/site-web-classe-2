window.addEventListener('DOMContentLoaded', function(){

async function hashHex(str){
  const enc=new TextEncoder().encode(str);
  const buf=await crypto.subtle.digest('SHA-256',enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// Initialisation
let users = {};
let feedbacks = [];
try{ users = JSON.parse(localStorage.getItem('users')) || {}; }catch(e){ users={}; }
try{ feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || []; }catch(e){ feedbacks=[]; }

let currentUser=null;
let isDelegateAuthorized=false;
let isSuperAdmin=false;

// Création des comptes initiaux si vide
if(Object.keys(users).length===0){
  users = {
    "a.abbygail": {nom:"ALBRECHT", prenom:"Abbygaïl", passHash:null, delegate:false},
    "b.louise": {nom:"BERNHARD", prenom:"Louise", passHash:null, delegate:false},
    "b.paul-alexandre": {nom:"BOULIVAN", prenom:"Paul-Alexandre", passHash:"35f20adae58723e5998d4c2d6d1789d530838ea1e8d193bc9df3af9a896f117e", delegate:true},
    "b.louis": {nom:"BRUCHON", prenom:"Louis", passHash:null, delegate:false},
    "c.elsa": {nom:"COFFINET", prenom:"Elsa", passHash:null, delegate:false},
    "c.lou": {nom:"CRAND", prenom:"Lou", passHash:null, delegate:false},
    "f.noé": {nom:"FAGET", prenom:"Noé", passHash:null, delegate:false},
    "g.timéo": {nom:"GOLDSCHMIDT", prenom:"Timéo", passHash:null, delegate:false},
    "c.émentine2": {nom:"GRANVEAUX SUTTER", prenom:"Clémentine", passHash:null, delegate:false},
    "g.cassie": {nom:"GUILLEMAIN", prenom:"Cassie", passHash:null, delegate:false},
    "h.zoé": {nom:"HORLACHER", prenom:"Zoé", passHash:null, delegate:false},
    "j.tinus": {nom:"JONAS", prenom:"Tinus", passHash:null, delegate:false},
    "k.faustine": {nom:"KAUFFMANN", prenom:"Faustine", passHash:null, delegate:false},
    "l.julie": {nom:"LIBIS", prenom:"Julie", passHash:null, delegate:false},
    "m.martin": {nom:"MEYER", prenom:"Martin", passHash:null, delegate:false},
    "s.amandine": {nom:"SIMON", prenom:"Amandine", passHash:null, delegate:false},
    "s.matthias": {nom:"STOELBEN", prenom:"Matthias", passHash:null, delegate:false},
    "v.hermione": {nom:"VIOL", prenom:"Hermione", passHash:null, delegate:false},
    "w.clémentine": {nom:"WALTER", prenom:"Clémentine", passHash:null, delegate:true},
    "w.léa": {nom:"WOLF LUX", prenom:"Léa", passHash:null, delegate:false}
  };
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('feedbacks', JSON.stringify([]));
}

// Helpers
function saveUsers(){ localStorage.setItem('users', JSON.stringify(users)); }
function saveFeedbacks(){ localStorage.setItem('feedbacks', JSON.stringify(feedbacks)); }
function generateID(prenom,nom){ return nom[0].toLowerCase()+"."+prenom.toLowerCase(); }

const authSection = document.getElementById('auth-section');
if(authSection) authSection.style.display='block';

// Enregistrement
window.register = async function(){
  const nom=document.getElementById('register-nom').value.trim();
  const prenom=document.getElementById('register-prenom').value.trim();
  const pass=document.getElementById('register-pass').value;
  const pass2=document.getElementById('register-pass2').value;
  const msg=document.getElementById('register-msg'); msg.textContent='';
  if(!nom||!prenom||!pass||!pass2){ msg.textContent='Remplis tous les champs.'; return; }
  if(pass!==pass2){ msg.textContent='Les mots de passe ne correspondent pas.'; return; }
  const id=generateID(prenom,nom);
  if(!users[id]){ msg.textContent=`Identifiant non reconnu (${id})`; return; }
  if(users[id].passHash){ msg.textContent=`Compte déjà créé pour ${id}`; return; }
  const h=await hashHex(pass); users[id].passHash=h; saveUsers();
  msg.style.color='green'; msg.textContent=`Compte créé ! Identifiant : ${id}`;
  setTimeout(()=>{ msg.textContent=''; msg.style.color=''; },6000);
}

// Connexion
window.login = async function(){
  const id=document.getElementById('login-id').value.trim();
  const pass=document.getElementById('login-pass').value;
  const msg=document.getElementById('login-msg'); msg.textContent='';
  if(!id||!pass){ msg.textContent='Remplis tous les champs.'; return; }
  const user=users[id];
  if(!user||!user.passHash){ msg.textContent='Compte non créé ou identifiant invalide.'; return; }
  const h=await hashHex(pass);
  if(h!==user.passHash){ msg.textContent='Identifiant ou mot de passe incorrect.'; return; }
  currentUser=id; localStorage.setItem('currentUser',id);

  isSuperAdmin=(id==='b.paul-alexandre');
  if(user.delegate){ 
    const code=prompt('Compte délégué détecté. Entre le code :'); 
    if(code==='LaclasseDe2A'){ isDelegateAuthorized=true; localStorage.setItem('delegate','true'); } 
    else { isDelegateAuthorized=false; localStorage.removeItem('delegate'); alert('Code délégué incorrect'); } 
  } else { isDelegateAuthorized=false; localStorage.removeItem('delegate'); }

  enterUser();
}

// Affichage utilisateur
function enterUser(){
  document.getElementById('auth-section').style.display='none';
  if(isSuperAdmin || (users[currentUser].delegate && isDelegateAuthorized)){
    document.getElementById('menu').style.display='flex';
    showPanel('classe-panel');
    loadAllEntries(); renderUsersList();
  } else document.getElementById('user-panel').style.display='block';
  document.getElementById('welcome').textContent=`Bonjour, ${users[currentUser].prenom} ${users[currentUser].nom}`;
}

// Menu
window.showPanel=function(panelId){
  document.getElementById('classe-panel').style.display='none';
  document.getElementById('gestion-panel').style.display='none';
  if(document.getElementById(panelId)) document.getElementById(panelId).style.display='block';
}

// Enregistrement feedback
window.saveFeedback=function(){
  const idea=document.getElementById('idea').value.trim();
  const problem=document.getElementById('problem').value.trim();
  const complaint=document.getElementById('complaint').value.trim();
  const msg=document.getElementById('save-msg'); msg.textContent='';
  if(!idea&&!problem&&!complaint){ msg.textContent='Écris au moins un champ.'; return; }
  feedbacks.push({user:currentUser,idea,problem,complaint,time:Date.now()}); saveFeedbacks();
  msg.style.color='green'; msg.textContent='Enregistré !'; setTimeout(()=>{ msg.textContent=''; msg.style.color=''; },3000);
  document.getElementById('idea').value=''; document.getElementById('problem').value=''; document.getElementById('complaint').value='';
  if(users[currentUser].delegate && isDelegateAuthorized || isSuperAdmin) loadAllEntries();
}

// Chargement feedback
function loadAllEntries(){
  const ideasDiv=document.getElementById('allIdeas');
  const problemDiv=document.getElementById('allProblems');
  const compDiv=document.getElementById('allComplaints');
  ideasDiv.innerHTML=''; problemDiv.innerHTML=''; compDiv.innerHTML='';
  feedbacks.slice().reverse().forEach(f=>{
    if(f.idea) ideasDiv.insertAdjacentHTML('beforeend',`<p><strong>${f.user}</strong><br>${escapeHtml(f.idea)}</p>`);
    if(f.problem) problemDiv.insertAdjacentHTML('beforeend',`<p><strong>${f.user}</strong><br>${escapeHtml(f.problem)}</p>`);
    if(f.complaint) compDiv.insertAdjacentHTML('beforeend',`<p><strong>${f.user}</strong><br>${escapeHtml(f.complaint)}</p>`);
  });
}

// Gestion comptes
function renderUsersList(){
  const wrap=document.getElementById('users-list'); wrap.innerHTML='';
  Object.keys(users).sort().forEach(id=>{
    const u=users[id];
    const row=document.createElement('div'); row.className='user-row';
    row.innerHTML=`<div><strong>${id}</strong><div class="small-muted">${u.prenom} ${u.nom}${u.delegate?' • Délégué':''}</div></div>
      <div><button onclick="resetPwd('${id}')">Réinitialiser</button></div>`;
    wrap.appendChild(row);
  });
}

// Réinitialisation mot de passe
window.resetPwd=async function(id){
  if(!confirm(`Réinitialiser le mot de passe de ${id} ?`)) return;
  const temp="Temp1234"; const h=await hashHex(temp);
  users[id].passHash=h; saveUsers(); alert(`Mot de passe de ${id} réinitialisé : ${temp}`);
}

function escapeHtml(t){ return t.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
window.logout=function(){ localStorage.removeItem('currentUser'); localStorage.removeItem('delegate'); location.reload(); }

});
