import prisma from '@/database'
import envConfig from '@/config'
import axios from 'axios'
import { ManagerRoom, TableStatus, OrderStatus } from '@/constants/type'
import { FastifyInstance } from 'fastify'
import { guestCreateOrdersController } from './guest.controller'

const callGemini = async (prompt: string): Promise<string> => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${envConfig.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  )
  return response.data.candidates[0].content.parts[0].text
}

const callGroq = async (prompt: string): Promise<string> => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    },
    {
      headers: {
        Authorization: `Bearer ${envConfig.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  return response.data.choices[0].message.content
}

export const aiChatController = async (
  message: string,
  history?: { role: 'user' | 'ai'; content: string }[],
  fastify?: FastifyInstance,
  guestId?: number
) => {
  const [dishes, tables] = await Promise.all([
    prisma.dish.findMany({
      where: { status: 'Available' },
      select: {
        id: true,
        name: true,
        price: true,
        reviews: {
          select: { rating: true }
        }
      }
    }),
    prisma.table.findMany({
      where: { status: TableStatus.Available },
      select: { number: true, capacity: true }
    })
  ])

  const dishContext = dishes
    .map((d) => {
      const avgRating =
        d.reviews.length > 0
          ? (d.reviews.reduce((acc, r) => acc + r.rating, 0) / d.reviews.length).toFixed(1)
          : 'Chưa có'
      return `- ${d.id}: ${d.name} (${d.price.toLocaleString('vi-VN')}đ) - Đánh giá: ${avgRating}${avgRating !== 'Chưa có' ? '/5 ⭐' : ''}`
    })
    .join('\n')
  const tableContext = tables.map((t) => `- Bàn số ${t.number} (Sức chứa: ${t.capacity} người)`).join('\n')

  let guestContext = `Khách chưa đăng nhập bằng QR code.
  QUY TẮC GỌI MÓN (Dành cho khách chưa đăng nhập):
  - Khách CÓ THỂ gọi món nếu câu nói chứa TÊN, SỐ BÀN và TÊN MÓN ĂN (Ví dụ: "Quân bàn 3 lấy 1 phở" -> Tên: Quân, Bàn: 3, Món: 1 phở).
  - Bạn phải thông minh TỰ TRÍCH XUẤT Tên, Số bàn và Món ăn từ lời nói tự nhiên của khách. KHÔNG ép khách phải nói theo một khuôn mẫu nhất định.
  - Khi đã nhận diện đủ 3 yếu tố (Tên, Số bàn, Món ăn), bạn PHẢI tự động chèn dòng lệnh này ở cuối câu trả lời: [ORDER_GUEST: Tên | Số_bàn | id_món-số_lượng, id_món-số_lượng]
    Ví dụ nhận diện được "Quan" ở "bàn 5" gọi 2 "Phở bò" (ID 1): [ORDER_GUEST: Quan | 5 | 1-2]
  - TUYỆT ĐỐI KHÔNG giải thích cho khách về dòng lệnh [ORDER_GUEST...] và KHÔNG nhắc đến ID của món ăn trong câu trả lời. Bạn chỉ cần trả lời ngắn gọn, tự nhiên, ví dụ: "Cảm ơn Quân, tôi đã ghi nhận 1 Smoothie Bơ Tươi tại bàn số 3."
  - QUAN TRỌNG: Hãy luôn kiểm tra LỊCH SỬ CHAT bên dưới. Nếu khách đã từng cho biết tên và số bàn (ví dụ trong lúc đặt bàn), hãy TỰ ĐỘNG sử dụng thông tin đó để gọi món mà KHÔNG ĐƯỢC hỏi lại khách. Chỉ khi nào thông tin hoàn toàn không có trong lịch sử thì mới được hỏi.`

  if (guestId) {
    const guest = await prisma.guest.findUnique({ where: { id: guestId } })
    if (guest && guest.tableNumber) {
      guestContext = `Khách tên là ${guest.name}, đang ngồi tại bàn số ${guest.tableNumber} (Đã đăng nhập qua QR).
      QUY TẮC GỌI MÓN VÀ THANH TOÁN:
      - Khách CÓ THỂ gọi món. Khi khách yêu cầu gọi món (với danh sách món và số lượng), bạn PHẢI thêm dòng lệnh này ở cuối: [ORDER: id_món-số_lượng, id_món-số_lượng]
        Ví dụ khách gọi 2 "Phở bò" (ID 1) và 1 "Cà phê" (ID 5): [ORDER: 1-2, 5-1]
      - QUY TRÌNH THANH TOÁN:
        + B1: Khi khách yêu cầu tính tiền/thanh toán, bạn KHÔNG ĐƯỢC sinh ra lệnh [PAY] ngay. Hãy xác nhận tổng số tiền (dựa vào lịch sử gọi món) và hỏi: "Bạn muốn thanh toán tại quầy hay chuyển khoản?".
        + B2: Nếu khách trả lời "tại quầy", hãy hướng dẫn họ ra quầy thu ngân.
        + B3: Nếu khách trả lời "chuyển khoản", bạn TUYỆT ĐỐI PHẢI chèn đúng dòng lệnh này ở cuối câu trả lời: [PAY] (Khi có lệnh [PAY], hệ thống sẽ tự động hiển thị mã QR thanh toán của cửa hàng cho khách).`
    }
  }

  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]

  const historyContext =
    history && history.length > 0
      ? `LỊCH SỬ CHAT:\n${history.map((h) => `${h.role === 'user' ? 'Khách' : 'AI'}: ${h.content}`).join('\n')}`
      : ''
  
  const prompt = `
    Bạn là trợ lý ảo của nhà hàng RMS-AI. Hôm nay là ngày ${currentDate}.
    THỰC ĐƠN:
    ${dishContext}
    DANH SÁCH BÀN TRỐNG:
    ${tableContext}
    TÌNH TRẠNG KHÁCH:
    ${guestContext}
    GỢI Ý MÓN ĂN:
    - Nếu khách nhờ gợi ý món ngon hoặc món bán chạy, hãy dựa vào số sao Đánh giá trong THỰC ĐƠN. 
    - Ưu tiên giới thiệu các món có điểm Đánh giá từ 4.5 ⭐ trở lên. Nếu món chưa có đánh giá, hãy giới thiệu như một món mới nên thử.
    QUY TẮC ĐẶT BÀN:
    - Nếu khách muốn đặt bàn, hãy tư vấn bàn phù hợp.
    - Hỏi khách thời gian đặt bàn (giờ bắt đầu và giờ kết thúc).
    - Khi khách xác nhận đặt một bàn cụ thể (với Tên, SĐT, Ngày, Giờ bắt đầu, Giờ kết thúc), bạn PHẢI thêm dòng lệnh này ở cuối:
      [BOOK_TABLE: số_bàn, END: YYYY-MM-DD HH:mm]
      Ví dụ: [BOOK_TABLE: 3, END: ${currentDate} 17:00]
    - Nếu khách không nói giờ kết thúc, mặc định là 2 tiếng sau giờ bắt đầu.
    
    ${historyContext}
    
    Câu hỏi của khách: "${message}"
  `

  const callAiWithFallback = async (): Promise<string> => {
    if (envConfig.GEMINI_API_KEY) {
      for (let i = 0; i < 2; i++) {
        try {
          console.log(`[AI] Gọi Gemini${i > 0 ? ` (retry ${i})` : ''}...`)
          return await callGemini(prompt)
        } catch (error: any) {
          const status = error.response?.status
          if (status === 429 || status === 503) {
            console.log(`[AI] Gemini bị rate limit (${status}), ${i < 1 ? 'thử lại...' : 'chuyển sang Groq...'}`)
            if (i < 1) {
              // Chờ thời gian API yêu cầu hoặc mặc định 10s
              let waitMs = 10000
              const errMsg = JSON.stringify(error.response?.data || '')
              const match = errMsg.match(/retry in (\d+\.?\d*)s/)
              if (match) waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000
              await new Promise((resolve) => setTimeout(resolve, waitMs))
            }
            continue
          }
          throw error
        }
      }
    }

    if (envConfig.GROQ_API_KEY) {
      console.log('[AI] Sử dụng Groq làm fallback...')
      return await callGroq(prompt)
    }

    throw new Error('Không có AI provider nào khả dụng. Vui lòng cấu hình GEMINI_API_KEY hoặc GROQ_API_KEY.')
  }

  try {
    let aiResponse = await callAiWithFallback()

    const bookTableMatch = aiResponse.match(/\[BOOK_TABLE:\s*(\d+)(?:,\s*END:\s*([\d-]+\s[\d:]+))?\]/)
    if (bookTableMatch) {
      const tableNumber = parseInt(bookTableMatch[1])
      const endTimeStr = bookTableMatch[2]
      let reservedEndAt: Date
      if (endTimeStr) {
        reservedEndAt = new Date(endTimeStr.replace(' ', 'T') + ':00+07:00')
      } else {
        reservedEndAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // +2 tiếng
      }

      await prisma.table.update({
        where: { number: tableNumber },
        data: {
          status: TableStatus.Reserved,
          reservedEndAt
        }
      })

      if (fastify) {
        fastify.io.to(ManagerRoom).emit('update-table')
      }

      const endFormatted = reservedEndAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      aiResponse = aiResponse.replace(/\[BOOK_TABLE:[^\]]*\]/, '').trim()
    }

    const orderGuestMatch = aiResponse.match(/\[ORDER_GUEST:\s*(.*?)\s*\|\s*(\d+)\s*\|\s*(.*?)\]/i)
    if (orderGuestMatch) {
      const guestName = orderGuestMatch[1].trim()
      const tableNumber = parseInt(orderGuestMatch[2].trim())
      const orderItemsStr = orderGuestMatch[3]

      let targetGuest = await prisma.guest.findFirst({
        where: { name: guestName, tableNumber },
        orderBy: { createdAt: 'desc' }
      })

      if (!targetGuest) {
        // Tự động tạo khách mới nếu không tìm thấy (ví dụ sau khi đặt bàn)
        targetGuest = await prisma.guest.create({
          data: { name: guestName, tableNumber }
        })
      }

      if (targetGuest) {
        const orderItems = orderItemsStr
          .split(',')
          .map((item) => {
            const [dishIdStr, quantityStr] = item.split('-')
            return { dishId: parseInt(dishIdStr.trim()), quantity: parseInt(quantityStr.trim()) }
          })
          .filter((item) => !isNaN(item.dishId) && !isNaN(item.quantity))

        if (orderItems.length > 0) {
          const result = await guestCreateOrdersController(targetGuest.id, orderItems)
          if (fastify) {
            fastify.io.to(ManagerRoom).emit('new-order', result)
          }
          aiResponse = aiResponse.replace(/\[ORDER_GUEST:[^\]]*\]/i, '').trim()
        }
      }
    }

    if (guestId) {
      const orderMatch = aiResponse.match(/\[ORDER:\s*(.*?)\]/)
      if (orderMatch) {
        const orderItemsStr = orderMatch[1]
        const orderItems = orderItemsStr
          .split(',')
          .map((item) => {
            const [dishIdStr, quantityStr] = item.split('-')
            return { dishId: parseInt(dishIdStr.trim()), quantity: parseInt(quantityStr.trim()) }
          })
          .filter((item) => !isNaN(item.dishId) && !isNaN(item.quantity))

        if (orderItems.length > 0) {
          const result = await guestCreateOrdersController(guestId, orderItems)
          if (fastify) {
            fastify.io.to(ManagerRoom).emit('new-order', result)
          }
          aiResponse = aiResponse.replace(/\[ORDER:[^\]]*\]/, '').trim()
        }
      }

      const payMatch = aiResponse.match(/\[PAY\]/)
      if (payMatch) {
        // Fetch unpaid orders to calculate amount
        const unpaidOrders = await prisma.order.findMany({
          where: {
            guestId,
            status: {
              in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered]
            }
          },
          include: { dishSnapshot: true }
        })

        if (unpaidOrders.length === 0) {
          aiResponse = aiResponse.replace(/\[PAY\]/, 'Bạn không có hóa đơn nào cần thanh toán.').trim()
        } else {
          const amount = unpaidOrders.reduce((acc, order) => acc + order.dishSnapshot.price * order.quantity, 0)
          const bankBin = '970422'
          const bankAccount = '0826477024'
          const qrUrl = `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact.png?amount=${amount}&addInfo=Thanh toan don hang RMS AI`

          aiResponse = aiResponse
            .replace(
              /\[PAY\]/,
              `\n[IMG: ${qrUrl}]\nVui lòng quét mã QR trên để thanh toán. Cửa hàng sẽ xác nhận sau khi bạn chuyển khoản thành công.`
            )
            .trim()
        }
      }
    }

    return aiResponse
  } catch (error: any) {
    console.error('AI Error:', error.response?.data || error.message)
    return 'Hệ thống AI đang quá tải một chút, bạn vui lòng thử lại sau vài giây nhé!'
  }
}
