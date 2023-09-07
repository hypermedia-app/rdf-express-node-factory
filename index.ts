import path from 'path'
import type express from 'express'
import absoluteUrl from 'absolute-url'
import type { DataFactory, NamedNode } from '@rdfjs/types'
import isAbsoluteUrl from 'is-absolute-url'
import { Environment } from '@rdfjs/environment/Environment'
import D from '@rdfjs/environment/DataFactory.js'
import E from '@rdfjs/environment'

type Env = Environment<DataFactory>

declare module 'express-serve-static-core' {
  export interface Request {
    rdf: Env
  }
}

export function attach(req: express.Request, factory: Env = new E([D])): void {
  if (!req.rdf) {
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

        return factory.namedNode(uri.toString() as unknown as Iri)
      },
    }
  }
}

export default function (factory?: Env): express.RequestHandler {
  return (req, res, next) => {
    attach(req, factory)

    next()
  }
}
