import { createReview, deleteReview, getReviewsByDishId } from '@/controllers/review.controller'
import { requireGuestHook, requireLoginedHook } from '@/hooks/auth.hooks'
import { MessageRes, MessageResType } from '@/schemaValidations/common.schema'
import { CreateDishBody } from '@/schemaValidations/dish.schema'
import {
  CreateReviewBody,
  CreateReviewBodyType,
  DishReviewParams,
  DishReviewParamsType,
  ReviewListRes,
  ReviewListResType,
  ReviewParams,
  ReviewParamsType,
  ReviewRes,
  ReviewResType
} from '@/schemaValidations/review.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function reviewRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{
    Params: DishReviewParamsType
    Reply: ReviewListResType
  }>(
    '/dish/:dishId',
    {
      schema: {
        params: DishReviewParams,
        response: {
          200: ReviewListRes
        }
      }
    },
    async (request, reply) => {
      const reviews = await getReviewsByDishId(request.params.dishId)
      reply.send({
        data: reviews as ReviewListResType['data'],
        message: 'Lấy danh sách dánh giá thành công!'
      })
    }
  )

  fastify.post<{
    Body: CreateReviewBodyType
    Reply: ReviewResType
  }>(
    '/',
    {
      schema: {
        body: CreateReviewBody,
        response: {
          200: ReviewRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestHook])
    },
    async (request, reply) => {
      const guestId = request.decodedAccessToken?.userId as number
      const review = await createReview(guestId, request.body)
      reply.send({
        data: review as ReviewResType['data'],
        message: 'Tạo đánh giá thành công'
      })
    }
  )

  fastify.delete<{
    Params: ReviewParamsType
    Reply: MessageResType
  }>(
    '/id',
    {
      schema: {
        params: ReviewParams,
        response: {
          200: MessageRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestHook])
    },
    async (request, reply) => {
      const guestId = request.decodedAccessToken?.userId as number
      await deleteReview(request.params.id, guestId)
      reply.send({
        message: 'Xoá thành công đánh giá!'
      })
    }
  )
}
