const express = require('express')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')

const query = require('./query')
const knex = require('./knex')

const app = express()
const urlencodedMiddleware = bodyParser.urlencoded({ extended: false })

app.use(cookieSession({
  name: 'session',
  keys: ['mysecret']
}))
app.set('view engine', 'ejs')

function authMiddleware(req, res, next){
  if(req.session.id){
    knex('user')
      .where({id: req.session.id})
      .first()
      .then(matched => {
        req.user = matched
        res.locals.user = matched
        next()
      })
  } else {
    res.redirect('/login')
  }

}

app.get('/', authMiddleware, (req, res)=> {
  knex('url_entry')
    .where({user_id: req.user.id})
    .then(rows=>{
      res.render('index.ejs', {rows})
    })
})

app.get('/login', (req, res)=>{
  res.render('login.ejs')
})

app.post('/login', urlencodedMiddleware, (req, res)=>{
  knex('user')
    .where({
      id: req.body.username,
      password: req.body.password
    })
    .first()
    .then(matched => {
      if(matched){
        req.session.id = matched.id
        res.redirect('/')
      } else {
        res.status(400)
        res.send('400 Bad Request')
      }
    })
})
/*
function authMiddleware(req, res, next) {
  if (req.session.user_id) {
    query.user.get(req.session.user_id).then(user => {
      req.user = user
      next()
    })
  } else {
    res.redirect('/login')
  }
}

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.post('/login', urlencodedMiddleware, (req, res) => {
  const {username, password} = req.body
  query.user.login(username, password)
    .then(user => {
      if (user) {
        req.session.user_id = user.id
        res.redirect('/')
      } else {
        res.status('400')
        res.send('아이디 혹은 비밀번호가 일치하지 않습니다.')
      }
    })
})

app.post('/logout', authMiddleware, (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.get('/', authMiddleware, (req, res) => {
  query.url_entry.list(req.user.id)
    .then(entries => {
      res.render('index.ejs', {entries})
    })
})

app.get('/:short_url', (req, res) => {
  query.url_entry.getByShortUrl(req.params.short_url)
    .then(entry => {
      if (entry) {
        res.redirect(301, entry.long_url)
      } else {
        res.status(404)
        res.send('404 Not Found')
      }
    })
})
*/
app.listen(3000, () => {
  console.log('listening...')
})
