import prisma from '@/database'
import { Cron } from 'croner'
import { ManagerRoom, TableStatus } from '@/constants/type'
import { FastifyInstance } from 'fastify'

// Chạy mỗi phút, kiểm tra bàn đã hết hạn đặt và chuyển về "Available"
const autoReleaseTableJob = (fastify: FastifyInstance) => {
  Cron('* * * * *', async () => {
    try {
      const now = new Date()
      const expiredTables = await prisma.table.updateMany({
        where: {
          status: TableStatus.Reserved,
          reservedEndAt: {
            lte: now
          }
        },
        data: {
          status: TableStatus.Available,
          reservedEndAt: null
        }
      })
      if (expiredTables.count > 0) {
        console.log(`[Auto Release] Đã chuyển ${expiredTables.count} bàn hết hạn về trạng thái "Có sẵn"`)
        fastify.io.to(ManagerRoom).emit('update-table')
      }
    } catch (error) {
      console.error('[Auto Release] Lỗi:', error)
    }
  })
}

export default autoReleaseTableJob
