import axios from 'axios'
import envConfig from '@/config'

export const sendTelegramMessage = async (message: string) => {
  const token = envConfig.TELEGRAM_BOT_TOKEN
  const chatId = envConfig.TELEGRAM_OWNER_CHAT_ID

  if (!token || !chatId) {
    // Nếu chưa cấu hình Token hoặc Chat ID thì bỏ qua, không làm lỗi app
    return
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  } catch (error) {
    console.error('Lỗi khi gửi thông báo Telegram:', error)
    // Cố tình không throw error để không làm gián đoạn luồng chính (vd: khách vẫn đặt món thành công)
  }
}
