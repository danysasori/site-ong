const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'segredo123',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static('public'));

const db = new sqlite3.Database('mensagens.db');

// ================= TABELAS =================

// Tabela mensagens
db.run(`
CREATE TABLE IF NOT EXISTS mensagens (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT,
email TEXT,
mensagem TEXT,
data TEXT
)
`);

// Tabela voluntários
db.run(`
CREATE TABLE IF NOT EXISTS voluntarios (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT,
email TEXT,
telefone TEXT,
mensagem TEXT,
data TEXT
)
`);

// ================= LOGIN =================

app.get('/login', (req, res) => {
  res.send(`
  <h2>Login Admin</h2>
  <form method="POST" action="/login">
  <input type="password" name="senha" placeholder="Digite a senha">
  <br><br>
  <button>Entrar</button>
  </form>
  `);
});

app.post('/login', (req, res) => {
  if (req.body.senha === "1234") {
    req.session.logado = true;
    res.redirect('/admin');
  } else {
    res.send("Senha incorreta");
  }
});

// ================= LOGOUT =================

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ================= CONTATO =================

app.post('/enviar', (req, res) => {

  const agora = new Date();
  const data = agora.toLocaleString();

  db.run(
    `INSERT INTO mensagens (nome, email, mensagem, data)
     VALUES (?, ?, ?, ?)`,
    [req.body.nome, req.body.email, req.body.mensagem, data]
  );

  res.redirect('/contato.html?sucesso=1');

});

// ================= VOLUNTÁRIO =================

app.post('/voluntario', (req, res) => {

  const agora = new Date();
  const data = agora.toLocaleString();

  db.run(
    `INSERT INTO voluntarios (nome, email, telefone, mensagem, data)
     VALUES (?, ?, ?, ?, ?)`,
    [
      req.body.nome,
      req.body.email,
      req.body.telefone,
      req.body.mensagem,
      data
    ],
    (err) => {
      if (err) {
        console.log(err);
        res.send("Erro ao salvar voluntário");
      } else {
        res.redirect('/voluntario.html?sucesso=1');
      }
    }
  );

});

// ================= VER VOLUNTÁRIOS =================

app.get('/admin-voluntarios', (req, res) => {

  if (!req.session.logado) {
    return res.redirect('/login');
  }

  db.all(`SELECT * FROM voluntarios ORDER BY id DESC`, [], (err, rows) => {

    if (err) {
      return res.send("Erro ao buscar voluntários");
    }

    let lista = "";

    rows.forEach(v => {
      lista += `
      <div style="
        background:white;
        padding:15px;
        margin-bottom:10px;
        border-radius:8px;
        box-shadow:0 0 5px rgba(0,0,0,0.1);
      ">
        <b>${v.nome}</b><br><br>

        <b>Email:</b> ${v.email}<br>
        <b>Telefone:</b> ${v.telefone}<br>
        <b>Mensagem:</b> ${v.mensagem}<br>
        <b>Data:</b> ${v.data}
      </div>
      `;
    });

    res.send(`
    <html>

    <head>
      <title>Voluntários</title>
    </head>

    <body style="
      font-family:Arial;
      background:#f4f4f4;
      padding:30px;
    ">

      <h1>Voluntários cadastrados</h1>

      ${lista}

      <br>

      <a href="/admin">
        ⬅ Voltar
      </a>

    </body>

    </html>
    `);

  });

});

// ================= ADMIN =================

app.get('/admin', (req, res) => {

  if (!req.session.logado) {
    return res.redirect('/login');
  }

  res.send(`
  <html>

  <head>
    <title>Admin</title>
  </head>

  <body style="
    font-family:Arial;
    padding:30px;
  ">

    <h1>Painel Admin</h1>

    <br>

    <a href="/admin-voluntarios">
      Ver voluntários
    </a>

    <br><br>

    <a href="/logout">
      Sair
    </a>

  </body>

  </html>
  `);

});
// ================= SERVIDOR =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});