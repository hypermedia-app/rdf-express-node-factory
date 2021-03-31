import type express from 'express'
import absoluteUrl from 'absolute-url'
import { DataFactory, NamedNode } from 'rdf-js'
import $rdf from 'rdf-ext'
import path from 'path'
import isAbsoluteUrl from 'is-absolute-url'

declare module 'express-serve-static-core' {
  export interface Request {
    rdf: DataFactory
  }
}

export default function (factory: DataFactory = $rdf): express.RequestHandler {
  return (req, res, next) => {
    absoluteUrl.attach(req)
    const baseIri = new URL(req.absoluteUrl())

    req.rdf = {
      ...factory,
      namedNode<Iri extends string = string>(value: Iri): NamedNode<Iri> {
        if (isAbsoluteUrl(value)) {
          return factory.namedNode(value)
        }

        const uri = value.startsWith('/')
          ? new URL(path.join(req.baseUrl, value), baseIri)
          : new URL(value, baseIri)

        return factory.namedNode<any>(uri.toString())
      },
    }

    next()
  }
}
