const ampt = require('@ampt/sdk')
const express = require('express')
import prismic, { ImageField, Slice } from '@prismicio/client'
import { Application } from 'express'

const { http, params } = ampt

// the backend
require('dotenv').config()

const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const app: Application = express()
const path = require('path')
// const port = process.env.EXPRESS_PORT || 8160

interface DocumentLink {
  id: string;
  type: 'about' | 'collections' | 'product';
  tags: string[];
  lang: string;
  slug: string;
  first_publication_date: string;
  last_publication_date: string;
  uid: string;
  link_type: 'Document';
  isBroken: boolean;
}

interface GalleryImage {image: ImageField}

interface AboutPageSlice extends Omit<Slice, 'items'> {
  items: GalleryImage[];
}

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

const fetch = import('node-fetch')
const prismicH = require('@prismicio/helpers')
const UAParser = require('ua-parser-js')

const repoName = params('PRISMIC_REPO')
const accessToken = params('PRISMIC_TOKEN')

// Note:
// If you're pulling this down, comment out the two lines above
// and use the two lines below, but with your own .env or token

// const repoName = 'amelof' // Fill in your repository name.
// const accessToken = process.env.PRISMIC_ACCESS_TOKEN // If your repository is private, add an access token.

const client = prismic.createClient(repoName, {
  // @ts-ignore
  fetch,
  accessToken
})

const handleLinkResolver = (doc: DocumentLink) => {

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

  res.locals.Numbers = (index: number) =>
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
  let assets: (string | null | undefined)[] = []

  home.data.gallery.forEach((homeGalleryImage: GalleryImage) => {
    assets.push(homeGalleryImage.image.url)
  })

  about.data.gallery.forEach((aboutGalleryImage: GalleryImage) => {
    assets.push(aboutGalleryImage.image.url)
  })

  about.data.body.forEach((aboutPageSection: AboutPageSlice) => {
    if (aboutPageSection.slice_type === 'gallery') {
      aboutPageSection.items.forEach((sectionGalleryImage: GalleryImage) => {
          assets.push(sectionGalleryImage.image.url)
      })
    }
  })

  collections.forEach((collection) => {
    collection.data.products.forEach((collectionItem: {
      products_product: {
        id: string;
        type: string;
        tags: string[];
        lang: string;
        slug: string;
        first_publication_date: string;
        last_publication_date: string;
        uid: string;
        data: GalleryImage,
        link_type: string;
        isBroken: boolean;
      }
    }) => {

      assets.push(collectionItem.products_product.data.image.url)
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

// Note:
// Since this project uses a private beta of ampt,
// you'll need to remove or comment line 176
// and use app.listen() instead.

// app.listen(port, () => {
//   console.log(`Floema listening at http://localhost:${port}`)
// })

http.node.use(app)
