import envConfig from '@/config'
import fastifyStatic from '@fastify/static'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import path from 'path'

export default async function staticRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.register(fastifyStatic, {
    root: path.resolve(envConfig.UPLOAD_FOLDER),
    wildcard: true
  })
}
