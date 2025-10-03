// Comptes existants
const comptes = [
  { id: "a.abbygail", nom: "Abbygail", probleme: "Aucun" },
  { id: "f.baptiste", nom: "Baptiste", probleme: "Aucun" },
  { id: "b.louise", nom: "Louise", probleme: "Aucun" },
  { id: "b.paul-alexandre", nom: "Paul-Alexandre", probleme: "Aucun" },
  { id: "g.clémentine2", nom: "Clémentine 2", probleme: "Aucun" },
  { id: "c.lou", nom: "Lou", probleme: "Aucun" },
  { id: "c.elsa", nom: "Elsa", probleme: "Aucun" },
  { id: "f.noé", nom: "Noé", probleme: "Aucun" },
  { id: "g.cassie", nom: "Cassie", probleme: "Aucun" },
  { id: "g.timéo", nom: "Timéo", probleme: "Aucun" },
  { id: "h.zoé", nom: "Zoé", probleme: "Aucun" },
  { id: "j.tinus", nom: "Tinus", probleme: "Aucun" },
  { id: "k.faustine", nom: "Faustine", probleme: "Aucun" },
  { id: "l.julie", nom: "Julie", probleme: "Aucun" },
  { id: "b.louis", nom: "Louis", probleme: "Aucun" },
  { id: "w.léa", nom: "Léa", probleme: "Aucun" },
  { id: "m.martin", nom: "Martin", probleme: "Aucun" },
  { id: "s.amandine", nom: "Amandine", probleme: "Aucun" },
  { id: "s.matthias", nom: "Matthias", probleme: "Aucun" },
  { id: "v.hermione", nom: "Hermione", probleme: "Aucun" },
  { id: "w.clémentine", nom: "Clémentine", probleme: "Aucun" },
];

// Super admin credentials
const superAdmin = { user: "admin", pass: "admin123" };

// DOM elements
const loginSection = document.getElementById("login-section");
const classeSection = document.getElementById("classe-section");
const comptesSection = document.getElementById("comptes-section");
const comptesTable = document.getElementById("comptes-table");
const loginError = document.getElementById("login-error");

document.getElementById("login-btn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === superAdmin.user && password === superAdmin.pass) {
    loginSection.classList.add("hidden");
    classeSection.classList.remove("hidden");
    renderComptes();
  } else {
    loginError.textContent = "Identifiants incorrects.";
  }
});

// Navigation
document.getElementById("menu-classe").addEventListener("click", () => {
  classeSection.classList.remove("hidden");
  comptesSection.classList.add("hidden");
});

document.getElementById("menu-comptes").addEventListener("click", () => {
  comptesSection.classList.remove("hidden");
  classeSection.classList.add("hidden");
});

document.getElementById("logout").addEventListener("click", () => {
  location.reload();
});

// Afficher les comptes
function renderComptes() {
  comptesTable.innerHTML = "";
  comptes.forEach(c => {
    const row = `<tr>
      <td>${c.id}</td>
      <td>${c.nom}</td>
      <td>${c.probleme}</td>
    </tr>`;
    comptesTable.innerHTML += row;
  });
}
