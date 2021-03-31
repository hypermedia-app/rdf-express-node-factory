import { describe, it } from 'mocha'
import request from 'supertest'
import express, { Express, Router } from 'express'
import { expect } from 'chai'
import sinon from 'sinon'
import { DataFactory } from 'rdf-js'
import middleware from '..'

describe('middleware', () => {
  let app: Express
  let factory: DataFactory

  beforeEach(() => {
    app = express()
    factory = {
      blankNode: sinon.spy(),
      defaultGraph: sinon.spy(),
      literal: sinon.spy(),
      namedNode: sinon.spy(),
      quad: sinon.spy(),
      variable: sinon.spy(),
    }
  })

  describe('req.rdf.namedNode', () => {
    it('returns absolute URIs when argument is relative', async () => {
      // given
      app.use(middleware())
      app.use('/foo', Router().get('*', (req, res) => {
        res.send(req.rdf.namedNode('/bar').value)
      }))

      // when
      const response = request(app)
        .get('/foo/bar/baz')
        .set('host', 'example.com')

      // then
      await response
        .expect('http://example.com/foo/bar')
    })

    it('returns unchanged URI when it is already absolute', async () => {
      // given
      app.use(middleware())
      app.use('/foo', (req, res) => {
        res.send(req.rdf.namedNode('https://example.org/foo/baz').value)
      })

      // when
      const response = request(app)
        .get('/foo/bar/baz')
        .set('host', 'example.com')

      // then
      await response
        .expect('https://example.org/foo/baz')
    })

    it('returns unchanged URI when it is an URN', async () => {
      // given
      app.use(middleware())
      app.use('/foo', (req, res) => {
        res.send(req.rdf.namedNode('urn:foo:bar').value)
      })

      // when
      const response = request(app)
        .get('/foo/bar/baz')
        .set('host', 'example.com')

      // then
      await response
        .expect('urn:foo:bar')
    })
  })

  const factoryMethods: Array<keyof typeof factory> = [
    'defaultGraph', 'quad', 'variable', 'literal', 'blankNode',
  ]

  factoryMethods.forEach(method => {
    describe(`req.rdf.${method}`, () => {
      it('calls underlying factory', async () => {
        // given
        app.use(middleware(factory))
        app.use('/foo', (req, res) => {
          const factoryMethod = req.rdf[method] as any
          res.send(factoryMethod())
        })

        // when
        await request(app)
          .get('/foo/bar/baz')

        // then
        expect(factory[method]).to.have.been.called
      })
    })
  })
})
