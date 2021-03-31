# rdf-express-node-factory [![codecov](https://codecov.io/gh/hypermedia-app/rdf-express-node-factory/branch/master/graph/badge.svg?token=LMrVUAvrHu)](https://codecov.io/gh/hypermedia-app/rdf-express-node-factory)
Express middleware which sets up an RDF/JS factory creating named nodes relative to the request URL

## Why?

An express server application will run on a specific endpoint, configured by the deployment and app configuration. For example, it may be deployed to serve requests to `https://my.super.app/` with base path set up as

```js
app.use('/admin', adminApiMiddleware)
```

This package solves the problem that the individual handler middleware is not aware of the path and hosting environment. 

This package removes the need for passing around an environment variable such as `BASE_URI` and instead constructs absolute URIs automatically into [RDF/JS Named Nodes](https://rdf.js.org/data-model-spec/#namednode-interface).

## Setup

The package exports a single factory function, which returns an express middleware. 

There is an optional [DataFactory](https://rdf.js.org/data-model-spec/#datafactory-interface) parameter. By default, [rdf-ext](https://npm.im/rdf-ext) is used.

The middleware attaches an RDF/JS DataFactory to the `Request` object as `req.rdf`.

## Usage

```js
import express from 'express'
import nodeFactory from 'rdf-express-node-factory'

// assuming host is https://example.com
const app = express()

const adminApiMiddleware = express.Router()
    .get('/home', (req, res, next) => {
        // absolute paths resolved to the routing base
        // https://example.com/admin/users
        const usersId = req.rdf.namedNode('/users')
       
        // relative paths resolved against current resource
        // https://example.com/admin/home/dashboard
        const dashboardId = req.rdf.namedNode('dashboard')
        
        // the rest of your code
        next()
    })

app.use(nodeFactory())
app.use('/admin', adminApiMiddleware)
```
