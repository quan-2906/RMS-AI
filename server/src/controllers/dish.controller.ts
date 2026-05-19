import prisma from '@/database'
import { CreateDishBodyType, UpdateDishBodyType } from '@/schemaValidations/dish.schema'
import { sendTelegramMessage } from '@/utils/telegram'

export const getDishList = async () => {
  const dishes = await prisma.dish.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      reviews: { select: { rating: true } }
    }
  })
  return dishes.map((dish) => {
    const totalRating = dish.reviews.reduce((acc, curr) => acc + curr.rating, 0)
    const avgRating = dish.reviews.length > 0 ? totalRating / dish.reviews.length : 0
    return {
      ...dish,
      rating: Number(avgRating.toFixed(1))
    }
  })
}

export const getDishListWithPagination = async (page: number, limit: number) => {
  const data = await prisma.dish.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      reviews: { select: { rating: true } }
    }
  })
  const totalItem = await prisma.dish.count()
  const totalPage = Math.ceil(totalItem / limit)

  const items = data.map((dish) => {
    const totalRating = dish.reviews.reduce((acc, curr) => acc + curr.rating, 0)
    const avgRating = dish.reviews.length > 0 ? totalRating / dish.reviews.length : 0
    return {
      ...dish,
      rating: Number(avgRating.toFixed(1))
    }
  })
  return {
    items: data,
    totalItem,
    page,
    limit,
    totalPage
  }
}

export const getDishDetail = async (id: number) => {
  const dish = await prisma.dish.findUniqueOrThrow({
    where: {
      id
    },
    include: {
      reviews: { select: { rating: true } }
    }
  })

  const totalRating = dish.reviews.reduce((acc, curr) => acc + curr.rating, 0)
  const avgRating = dish.reviews.length > 0 ? totalRating / dish.reviews.length : 0

  return {
    ...dish,
    rating: Number(avgRating.toFixed(1))
  }
}

export const createDish = async (data: CreateDishBodyType) => {
  const result = await prisma.dish.create({
    data: data as any
  })
  try {
    sendTelegramMessage(`🍲 <b>Thêm món mới</b>\nTên món: ${result.name}\nGiá: ${result.price} VNĐ`)
  } catch (error) {}
  return result
}

export const updateDish = async (id: number, data: UpdateDishBodyType) => {
  const result = await prisma.dish.update({
    where: {
      id
    },
    data: data as any
  })
  try {
    sendTelegramMessage(`📝 <b>Cập nhật món ăn</b>\nTên món: ${result.name}`)
  } catch (error) {}
  return result
}

export const deleteDish = async (id: number) => {
  const result = await prisma.dish.delete({
    where: {
      id
    }
  })
  try {
    sendTelegramMessage(`🗑 <b>Xóa món ăn</b>\nTên món: ${result.name}`)
  } catch (error) {}
  return result
}
