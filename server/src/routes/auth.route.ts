import envConfig from '@/config'
import {
  loginController,
  loginGoogleController,
  logoutController,
  refreshTokenController,
  verify2FALoginController
} from '@/controllers/auth.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import {
  LoginBody,
  LoginBodyType,
  LoginGoogleQuery,
  LoginGoogleQueryType,
  LoginRes,
  LoginResType,
  LogoutBody,
  LogoutBodyType,
  RefreshTokenBody,
  RefreshTokenBodyType,
  RefreshTokenRes,
  RefreshTokenResType,
  Verify2FABody,
  Verify2FABodyType
} from '@/schemaValidations/auth.schema'
import { MessageRes, MessageResType } from '@/schemaValidations/common.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const queryString = (await import('querystring')).default
  fastify.post<{ Reply: MessageResType; Body: LogoutBodyType }>(
    '/logout',
    {
      schema: {
        response: {
          200: MessageRes
        },
        body: LogoutBody
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const message = await logoutController(request.body.refreshToken)
      reply.send({
        message
      })
    }
  )
  fastify.post<{ Reply: LoginResType; Body: LoginBodyType }>(
    '/login',
    {
      schema: {
        response: {
          200: LoginRes
        },
        body: LoginBody
      }
    },
    async (request, reply) => {
      const { body } = request
      const result = await loginController(body)
      
      if ('data' in result && result.data?.require2FA) {
        reply.send({
          message: result.message,
          data: {
            require2FA: true,
            twoFactorToken: result.data.twoFactorToken
          } as any
        })
        return
      }

      const { accessToken, refreshToken, account } = result as any
      reply.send({
        message: 'Đăng nhập thành công',
        data: {
          account: account,
          accessToken,
          refreshToken
        }
      })
    }
  )

  fastify.post<{ Reply: LoginResType; Body: Verify2FABodyType }>(
    '/verify-2fa',
    {
      schema: {
        response: {
          200: LoginRes
        },
        body: Verify2FABody
      }
    },
    async (request, reply) => {
      const { twoFactorToken, otp } = request.body
      const { accessToken, refreshToken, account } = await verify2FALoginController(twoFactorToken, otp)
      reply.send({
        message: 'Xác thực 2 bước thành công',
        data: {
          account: account as LoginResType['data']['account'],
          accessToken,
          refreshToken
        }
      })
    }
  )
  fastify.get<{
    Querystring: LoginGoogleQueryType
  }>(
    '/login/google',
    {
      schema: {
        querystring: LoginGoogleQuery
      }
    },
    async (request, reply) => {
      const code = request.query.code
      try {
        const { accessToken, refreshToken } = await loginGoogleController(code)
        const qs = queryString.stringify({
          accessToken,
          refreshToken,
          status: 200
        })
        reply.redirect(`${envConfig.GOOGLE_REDIRECT_CLIENT_URL}?${qs}`)
      } catch (error: any) {
        const { message = 'Lỗi không xác định', status = 500 } = error
        const qs = queryString.stringify({
          message,
          status
        })
        reply.redirect(`${envConfig.GOOGLE_REDIRECT_CLIENT_URL}?${qs}`)
      }
    }
  )
  fastify.post<{
    Reply: RefreshTokenResType
    Body: RefreshTokenBodyType
  }>(
    '/refresh-token',
    {
      schema: {
        response: {
          200: RefreshTokenRes
        },
        body: RefreshTokenBody
      }
    },
    async (request, reply) => {
      const result = await refreshTokenController(request.body.refreshToken)
      reply.send({
        message: 'Lấy token mới thành công',
        data: result
      })
    }
  )
}
