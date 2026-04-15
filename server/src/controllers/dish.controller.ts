import prisma from '@/database'
import { CreateDishBodyType, UpdateDishBodyType } from '@/schemaValidations/dish.schema'

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

export const createDish = (data: CreateDishBodyType) => {
  return prisma.dish.create({
    data
  })
}

export const updateDish = (id: number, data: UpdateDishBodyType) => {
  return prisma.dish.update({
    where: {
      id
    },
    data
  })
}

export const deleteDish = (id: number) => {
  return prisma.dish.delete({
    where: {
      id
    }
  })
}
