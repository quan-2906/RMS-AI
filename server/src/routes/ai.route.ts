import { aiChatController } from '@/controllers/ai.controller'
import { AiChatBody, AiChatBodyType, AiChatRes, AiChatResType } from '@/schemaValidations/ai.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Role } from '@/constants/type'
import { verifyAccessToken } from '@/utils/jwt'

export default async function aiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post<{ Body: AiChatBodyType; Reply: AiChatResType }>(
    '/chat',
    {
      schema: {
        body: AiChatBody,
        response: {
          200: AiChatRes
        }
      }
    },
    async (request, reply) => {
      const { message, history } = request.body
      let guestId: number | undefined
      const accessToken = request.headers.authorization?.split(' ')[1]
      if (accessToken) {
        try {
          const decoded = verifyAccessToken(accessToken)
          if (decoded.role === Role.Guest) {
            guestId = decoded.userId
          }
        } catch (e) {}
      }
      const result = await aiChatController(message, history, fastify, guestId)
      reply.send({
        message: 'AI phản hồi thành công',
        data: result
      })
    }
  )
}
