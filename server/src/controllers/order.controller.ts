import { DishStatus, OrderStatus, TableStatus } from '@/constants/type'
import prisma from '@/database'
import { CreateOrdersBodyType, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { sendTelegramMessage } from '@/utils/telegram'

export const createOrdersController = async (orderHandlerId: number, body: CreateOrdersBodyType) => {
  const { guestId, orders } = body
  const guest = await prisma.guest.findUniqueOrThrow({
    where: {
      id: guestId
    }
  })
  if (guest.tableNumber === null) {
    throw new Error('Bàn gắn liền với khách hàng này đã bị xóa, vui lòng chọn khách hàng khác!')
  }
  const table = await prisma.table.findUniqueOrThrow({
    where: {
      number: guest.tableNumber
    }
  })
  if (table.status === TableStatus.Hidden) {
    throw new Error(`Bàn ${table.number} gắn liền với khách hàng đã bị ẩn, vui lòng chọn khách hàng khác!`)
  }

  const [ordersRecord, socketRecord] = await Promise.all([
    prisma.$transaction(async (tx) => {
      const ordersRecord = await Promise.all(
        orders.map(async (order) => {
          const dish = await tx.dish.findUniqueOrThrow({
            where: {
              id: order.dishId
            }
          })
          if (dish.status === DishStatus.Unavailable) {
            throw new Error(`Món ${dish.name} đã hết`)
          }
          if (dish.status === DishStatus.Hidden) {
            throw new Error(`Món ${dish.name} không thể đặt`)
          }
          const dishSnapshot = await tx.dishSnapshot.create({
            data: {
              description: dish.description,
              image: dish.image,
              images360: dish.images360 ?? undefined,
              name: dish.name,
              price: dish.price,
              dishId: dish.id,
              status: dish.status
            }
          })
          const orderRecord = await tx.order.create({
            data: {
              dishSnapshotId: dishSnapshot.id,
              guestId,
              quantity: order.quantity,
              tableNumber: guest.tableNumber,
              orderHandlerId,
              status: OrderStatus.Pending
            },
            include: {
              dishSnapshot: true,
              guest: true,
              orderHandler: true
            }
          })
          type OrderRecord = typeof orderRecord
          return orderRecord as OrderRecord & {
            status: (typeof OrderStatus)[keyof typeof OrderStatus]
            dishSnapshot: OrderRecord['dishSnapshot'] & {
              status: (typeof DishStatus)[keyof typeof DishStatus]
            }
          }
        })
      )
      return ordersRecord
    }),
    prisma.socket.findUnique({
      where: {
        guestId: body.guestId
      }
    })
  ])

  try {
    if (ordersRecord.length > 0) {
      const tableNumber = ordersRecord[0].tableNumber
      const totalQuantity = ordersRecord.reduce((acc, order) => acc + order.quantity, 0)
      let totalPrice = 0
      let dishDetails = ''
      ordersRecord.forEach(order => {
        const dishName = order.dishSnapshot.name
        const price = order.dishSnapshot.price
        const qty = order.quantity
        dishDetails += `\n- ${dishName} x${qty} (${(price * qty).toLocaleString('vi-VN')}đ)`
        totalPrice += price * qty
      })
      const message = `🔔 <b>Nhân viên vừa tạo đơn mới</b>\n📍 Bàn số: <b>${tableNumber}</b>\n🍽 Tổng món: <b>${totalQuantity}</b> phần\n💵 Tổng tiền: <b>${totalPrice.toLocaleString('vi-VN')}đ</b>\nChi tiết:${dishDetails}`
      sendTelegramMessage(message)
    }
  } catch (error) {}

  return {
    orders: ordersRecord,
    socketId: socketRecord?.socketId
  }
}

export const getOrdersController = async ({ fromDate, toDate }: { fromDate?: Date; toDate?: Date }) => {
  const orders = await prisma.order.findMany({
    include: {
      dishSnapshot: true,
      orderHandler: true,
      guest: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate
      }
    }
  })
  return orders
}

// Controller thanh toán các hóa đơn dựa trên guestId
export const payOrdersController = async ({ guestId, orderHandlerId }: { guestId: number; orderHandlerId: number }) => {
  const orders = await prisma.order.findMany({
    where: {
      guestId,
      status: {
        in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered]
      }
    }
  })
  if (orders.length === 0) {
    throw new Error('Không có hóa đơn nào cần thanh toán')
  }
  await prisma.$transaction(async (tx) => {
    const orderIds = orders.map((order) => order.id)
    const updatedOrders = await tx.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        status: OrderStatus.Paid,
        orderHandlerId
      }
    })
    return updatedOrders
  })
  const [ordersResult, sockerRecord] = await Promise.all([
    prisma.order.findMany({
      where: {
        id: {
          in: orders.map((order) => order.id)
        }
      },
      include: {
        dishSnapshot: true,
        orderHandler: true,
        guest: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.socket.findUnique({
      where: {
        guestId
      }
    })
  ])

  try {
    if (ordersResult.length > 0) {
      const tableNumber = ordersResult[0].tableNumber
      const cashierName = ordersResult[0].orderHandler?.name ?? `ID ${orderHandlerId}`
      const totalQuantity = ordersResult.reduce((acc, order) => acc + order.quantity, 0)
      let totalPrice = 0
      ordersResult.forEach(order => {
        totalPrice += order.dishSnapshot.price * order.quantity
      })
      const message = `✅ <b>Đã thanh toán thành công</b>\n📍 Bàn số: <b>${tableNumber}</b>\n💵 Tổng tiền: <b>${totalPrice.toLocaleString('vi-VN')}đ</b> (${totalQuantity} món)\n👤 Thu ngân: <b>${cashierName}</b>`
      sendTelegramMessage(message)
    }
  } catch (error) {}

  return {
    orders: ordersResult,
    socketId: sockerRecord?.socketId
  }
}

export const getOrderDetailController = (orderId: number) => {
  return prisma.order.findUniqueOrThrow({
    where: {
      id: orderId
    },
    include: {
      dishSnapshot: true,
      orderHandler: true,
      guest: true,
      table: true
    }
  })
}

export const updateOrderController = async (
  orderId: number,
  body: UpdateOrderBodyType & { orderHandlerId: number }
) => {
  const { status, dishId, quantity, orderHandlerId } = body
  const result = await prisma.$transaction(async (tx) => {
    const order = await prisma.order.findUniqueOrThrow({
      where: {
        id: orderId
      },
      include: {
        dishSnapshot: true
      }
    })
    let dishSnapshotId = order.dishSnapshotId
    if (order.dishSnapshot.dishId !== dishId) {
      const dish = await tx.dish.findUniqueOrThrow({
        where: {
          id: dishId
        }
      })
      const dishSnapshot = await tx.dishSnapshot.create({
        data: {
          description: dish.description,
          image: dish.image,
          images360: dish.images360 ?? undefined,
          name: dish.name,
          price: dish.price,
          dishId: dish.id,
          status: dish.status
        }
      })
      dishSnapshotId = dishSnapshot.id
    }
    const newOrder = await tx.order.update({
      where: {
        id: orderId
      },
      data: {
        status,
        dishSnapshotId,
        quantity,
        orderHandlerId
      },
      include: {
        dishSnapshot: true,
        orderHandler: true,
        guest: true
      }
    })
    return newOrder
  })
  const socketRecord = await prisma.socket.findUnique({
    where: {
      guestId: result.guestId!
    }
  })

  try {
    const tableNumber = result.tableNumber
    const dishName = result.dishSnapshot.name
    const message = `🔄 <b>Cập nhật đơn hàng</b>\n📍 Bàn số: <b>${tableNumber}</b>\n🍽 Món: ${dishName}\nℹ️ Trạng thái mới: <b>${status}</b>`
    sendTelegramMessage(message)
  } catch (error) {}

  return {
    order: result,
    socketId: socketRecord?.socketId
  }
}
