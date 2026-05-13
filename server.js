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

  <html>

  <head>
    <title>Login</title>

    <style>

      body{
        font-family:Arial;
        background:#f4f4f4;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
      }

      .box{
        background:white;
        padding:40px;
        border-radius:12px;
        box-shadow:0 0 10px rgba(0,0,0,0.1);
        width:300px;
      }

      input{
        width:100%;
        padding:12px;
        margin-top:15px;
        border:1px solid #ccc;
        border-radius:8px;
      }

      button{
        width:100%;
        padding:12px;
        margin-top:20px;
        border:none;
        background:#2c3e50;
        color:white;
        border-radius:8px;
        cursor:pointer;
      }

    </style>

  </head>

  <body>

    <div class="box">

      <h2>Login Admin</h2>

      <form method="POST" action="/login">

        <input
          type="password"
          name="senha"
          placeholder="Digite a senha"
          required
        >

        <button>
          Entrar
        </button>

      </form>

    </div>

  </body>

  </html>

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
    [
      req.body.nome,
      req.body.email,
      req.body.mensagem,
      data
    ]
  );

  res.redirect('/contato.html?sucesso=1');

});

// ================= VOLUNTÁRIO =================

app.post('/voluntario', (req, res) => {

  const agora = new Date();
  const data = agora.toLocaleString();

  db.run(
    `INSERT INTO voluntarios
    (nome, email, telefone, mensagem, data)
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

  db.all(
    `SELECT * FROM voluntarios ORDER BY id DESC`,
    [],
    (err, rows) => {

      if (err) {
        return res.send("Erro ao buscar voluntários");
      }

      let lista = "";

      rows.forEach(v => {

        lista += `

        <div class="card">

          <h2>${v.nome}</h2>

          <p>
            <strong>Email:</strong>
            ${v.email}
          </p>

          <p>
            <strong>Telefone:</strong>
            ${v.telefone}
          </p>

          <p>
            <strong>Mensagem:</strong>
            ${v.mensagem}
          </p>

          <p>
            <strong>Data:</strong>
            ${v.data}
          </p>

        </div>

        `;

      });

      res.send(`

      <!DOCTYPE html>

      <html lang="pt-br">

      <head>

        <meta charset="UTF-8">

        <title>Voluntários</title>

        <style>

          body{
            font-family:Arial;
            background:#f4f4f4;
            margin:0;
            padding:40px;
          }

          .container{
            max-width:900px;
            margin:auto;
          }

          h1{
            text-align:center;
            margin-bottom:30px;
          }

          .card{
            background:white;
            padding:25px;
            margin-bottom:20px;
            border-radius:12px;
            box-shadow:0 0 10px rgba(0,0,0,0.1);
          }

          .card h2{
            margin-bottom:15px;
            color:#2c3e50;
          }

          .card p{
            margin-bottom:10px;
          }

          .btn{
            display:inline-block;
            padding:12px 20px;
            background:#2c3e50;
            color:white;
            text-decoration:none;
            border-radius:8px;
          }

        </style>

      </head>

      <body>

        <div class="container">

          <h1>Voluntários cadastrados</h1>

          ${lista}

          <a href="/admin" class="btn">
            ⬅ Voltar
          </a>

        </div>

      </body>

      </html>

      `);

    }
  );

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

    <style>

      body{
        font-family:Arial;
        background:#f4f4f4;
        padding:40px;
      }

      .container{
        max-width:600px;
        margin:auto;
        background:white;
        padding:40px;
        border-radius:12px;
        box-shadow:0 0 10px rgba(0,0,0,0.1);
      }

      h1{
        margin-bottom:30px;
      }

      a{
        display:block;
        margin-bottom:15px;
        text-decoration:none;
        background:#2c3e50;
        color:white;
        padding:14px;
        border-radius:8px;
      }

    </style>

  </head>

  <body>

    <div class="container">

      <h1>Painel Admin</h1>

      <a href="/admin-voluntarios">
        Ver voluntários
      </a>

      <a href="/logout">
        Sair
      </a>

    </div>

  </body>

  </html>

  `);

});

// ================= SERVIDOR =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});