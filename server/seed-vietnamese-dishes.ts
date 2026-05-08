import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const vietnameseDishes = [
    {
      name: 'Phở Bò Tái Lăn Hà Nội',
      price: 65000,
      description: 'Phở bò tái lăn đậm đà hương vị truyền thống Hà Nội với nước dùng trong, thịt bò xào gừng tỏi thơm nức, hành lá xắt nhỏ và quẩy giòn.',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Bún Chả Cửa Bắc',
      price: 55000,
      description: 'Chả miếng và chả viên nướng than hoa thơm nức, ăn kèm bún tươi, rau sống đa dạng và nước mắm chua ngọt đặc trưng Hà Thành.',
      image: 'https://images.unsplash.com/photo-1625464161740-4246ed8101a9?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Bánh Mì Hội An Đặc Biệt',
      price: 35000,
      description: 'Bánh mì giòn rụm với nhân pate gan ngậy, xá xíu, chả lụa, dưa góp, rau thơm và nước sốt bí truyền của phố cổ Hội An.',
      image: 'https://images.unsplash.com/photo-1632778148798-84be407187c3?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Gỏi Cuốn Tôm Thịt Nam Bộ',
      price: 45000,
      description: 'Món khai vị thanh mát với tôm tươi, thịt luộc, bún tươi và rau sống cuốn trong lớp bánh tráng mỏng, chấm cùng tương đen đậu phộng.',
      image: 'https://images.unsplash.com/photo-1556040220-4096d522378d?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Cơm Tấm Sườn Bì Chả',
      price: 50000,
      description: 'Đặc sản Sài Gòn với sườn nướng mật ong thơm phức, bì heo trộn thính, chả trứng hấp béo ngậy và nước mắm kẹo.',
      image: 'https://images.unsplash.com/photo-1623843588960-ab7a66f24d77?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Bún Bò Huế Cố Đô',
      price: 60000,
      description: 'Sợi bún to, nước dùng đậm đà vị mắm ruốc, ăn kèm bắp bò, giò heo, huyết heo và rau bắp chuối bào đặc chất miền Trung.',
      image: 'https://images.unsplash.com/photo-1624300627238-99373eb182d0?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Nem Rán Hà Nội (Chả Giò)',
      price: 40000,
      description: 'Nem rán giòn vàng, nhân thịt băm, mộc nhĩ, nấm hương và miến - món ngon không thể thiếu trong các bữa tiệc Việt.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Bánh Xèo Miền Tây',
      price: 85000,
      description: 'Vỏ bánh giòn rụm vàng óng từ nghệ, nhân tôm thịt giá đỗ, ăn kèm rau rừng và nước mắm chua ngọt pha tỏi ớt.',
      image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Cà Phê Trứng Giảng',
      price: 45000,
      description: 'Lớp kem trứng béo ngậy, bông xốp được đánh kỹ, hòa quyện cùng hương vị cà phê Robusta đậm đà, thơm nức.',
      image: 'https://images.unsplash.com/photo-1534040385115-332cb5e523f6?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Nem Nướng Nha Trang',
      price: 75000,
      description: 'Nem nướng thơm nức mũi, ăn kèm bánh tráng chiên giòn, rau sống, xoài xanh và nước chấm tương đậu đặc biệt.',
      image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Bánh Bèo Chén Huế',
      price: 45000,
      description: 'Những chiếc bánh bèo nhỏ xinh trong chén sành, phủ lên trên là tôm cháy, mỡ hành, da heo chiên giòn và nước mắm ngọt.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Mì Quảng Tôm Thịt',
      price: 55000,
      description: 'Mì Quảng sợi vàng, nước dùng sền sệt đậm đà, ăn kèm tôm rim, thịt heo xá xíu, trứng cút và đậu phộng rang.',
      image: 'https://images.unsplash.com/photo-1594975344383-e18987114b30?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Bún Riêu Cua Đồng',
      price: 50000,
      description: 'Vị chua thanh từ cà chua và giấm bỗng, riêu cua béo ngậy, ăn kèm đậu hũ chiên, chả lụa và rau kinh giới.',
      image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Chả Cá Lã Vọng',
      price: 150000,
      description: 'Cá lăng nướng vàng ươm trên chảo nóng với hành và thì là, ăn kèm bún, lạc rang, rau thơm và mắm tôm pha chanh.',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Bún Đậu Mắm Tôm Đặc Biệt',
      price: 75000,
      description: 'Mẹt bún đậu đầy đủ với đậu hũ chiên giòn, thịt chân giò, chả cốm, nem chua rán và mắm tôm Thanh Hóa.',
      image: 'https://images.unsplash.com/photo-1620953942065-51d8b1db7b1c?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Cơm Rang Dưa Bò',
      price: 55000,
      description: 'Cơm rang hạt săn vàng, xào cùng dưa chua và thịt bò mềm, đậm đà gia vị, ăn kèm bát nước dùng thanh mát.',
      image: 'https://images.unsplash.com/photo-1512058560366-cd242d4532be?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Miến Lươn Nghệ An',
      price: 65000,
      description: 'Lươn đồng chiên giòn hoặc xào mềm, nước dùng xương đậm đà, ăn kèm rau răm, hành tây và miến dong dai ngon.',
      image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Rau Muống Xào Tỏi',
      price: 35000,
      description: 'Rau muống xanh mướt, giòn sần sật, xào cùng tỏi phi thơm nồng, là món ăn kèm lý tưởng cho mọi bữa cơm.',
      image: 'https://images.unsplash.com/photo-1548943487-a2e4f43bb385?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Canh Chua Cá Lóc',
      price: 95000,
      description: 'Vị chua từ me, ngọt từ cá lóc tươi, ăn kèm thơm, cà chua, bạc hà và giá đỗ, đậm đà hương vị miền Tây.',
      image: 'https://images.unsplash.com/photo-1544378730-8b5104b28751?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    },
    {
      name: 'Gà Nướng Mắc Khén',
      price: 180000,
      description: 'Gà đi bộ nướng vàng, ướp cùng hạt mắc khén, hạt dỗi thơm lừng đặc sản Tây Bắc, thịt ngọt và dai sần sật.',
      image: 'https://images.unsplash.com/photo-1598515322627-628a50f7f329?auto=format&fit=crop&q=80&w=1000',
      status: 'Available'
    }
  ]

  console.log('Đang xóa dữ liệu món ăn cũ...')
  await prisma.dish.deleteMany()

  console.log('Đang thêm các món ăn Việt Nam...')
  for (const dish of vietnameseDishes) {
    await prisma.dish.create({
      data: dish
    })
  }

  console.log(`Đã hoàn thành nạp ${vietnameseDishes.length} món ăn Việt Nam!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
