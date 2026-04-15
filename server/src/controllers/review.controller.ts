import prisma from '@/database'
import { CreateReviewBodyType } from '@/schemaValidations/review.schema'

export const getReviewsByDishId = async (dishId: number) => {
  const reviews = await prisma.review.findMany({
    where: { dishId },
    include: { guest: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return reviews.map((review) => ({
    ...review,
    guestName: review.guest.name
  }))
}

export const createReview = async (guestId: number, data: CreateReviewBodyType) => {
  const existingReview = await prisma.review.findUnique({
    where: {
      guestId_dishId: { guestId, dishId: data.dishId }
    }
  })

  if (existingReview) {
    throw new Error('Bạn đã đánh giá món ăn này rồi')
  }

  const review = await prisma.review.create({
    data: { guestId, ...data },
    include: { guest: { select: { name: true } } }
  })

  return { ...review, guestName: review.guest.name }
}

export const deleteReview = async (id: number, guestId: number) => {
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review || review.guestId !== guestId) {
    throw new Error('Không tìm thấy đánh giá hoặc không có quyền xóa')
  }

  return prisma.review.delete({ where: { id } })
}
