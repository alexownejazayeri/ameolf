// the backend
require('dotenv').config()

const logger = require('morgan')
const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const app = express()
const path = require('path')
const port = process.env.EXPRESS_PORT || 8160

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

const fetch = import('node-fetch')
const prismic = require('@prismicio/client')
const prismicH = require('@prismicio/helpers')
const UAParser = require('ua-parser-js')

const repoName = 'amelof' // Fill in your repository name.
const accessToken = process.env.PRISMIC_ACCESS_TOKEN // If your repository is private, add an access token.

const client = prismic.createClient(repoName, {
  fetch,
  accessToken
})

const handleLinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'collections') {
    return '/collections'
  }

  if (doc.type === 'about') {
    return '/about'
  }

  return '/'
}

app.use((req, res, next) => {
  const ua = UAParser(req.headers['user-agent'])

  res.locals.isDesktop = ua.device.type === undefined
  res.locals.isPhone = ua.device.type === 'mobile'
  res.locals.isTablet = ua.device.type === 'tablet'

  res.locals.ctx = {
    prismic,
    prismicH
  }

  res.locals.Numbers = (index) =>
    index === 0
      ? 'One'
      : index === 1
        ? 'Two'
        : index === 2
          ? 'Three'
          : index === 3
            ? 'Four'
            : ''
  res.locals.Link = handleLinkResolver

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async () => {
  const about = await client.getSingle('about')
  const home = await client.getSingle('home')
  const meta = await client.getSingle('meta')
  const navigation = await client.getSingle('navigation')
  const preloader = await client.getSingle('preloader')

  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image'
  })

  // Pre-fetching content and loading to GPU
  // to avoid "flash of content"
  const assets = []

  home.data.gallery.forEach((item) => {
    assets.push(item.image.url)
  })

  about.data.gallery.forEach((item) => {
    assets.push(item.image.url)
  })

  about.data.body.forEach((section) => {
    if (section.slice_type === 'gallery') {
      section.items.forEach((item) => {
        assets.push(item.image.url)
      })
    }
  })

  collections.forEach((collection) => {
    collection.data.products.forEach((item) => {
      assets.push(item.products_product.data.image.url)
    })
  })

  return {
    about,
    assets,
    collections,
    home,
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  const defaults = await handleRequest()

  res.render('pages/home', { ...defaults })
})

app.get('/about', async (req, res) => {
  const defaults = await handleRequest()

  res.render('pages/about', { ...defaults })
})

app.get('/collections', async (req, res) => {
  const defaults = await handleRequest()

  res.render('pages/collections', { ...defaults })
})

app.get('/detail/:uid', async (req, res) => {
  const defaults = await handleRequest()
  const product = await client.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })

  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`Floema listening at http://localhost:${port}`)
})
