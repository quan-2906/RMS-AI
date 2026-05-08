import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const images = [
    'http://localhost:4000/static/sushi_360_01.png',
    'http://localhost:4000/static/sushi_360_02.png',
    'http://localhost:4000/static/sushi_360_03.png',
    'http://localhost:4000/static/sushi_360_04.png'
  ]

  const dish = await prisma.dish.findFirst({
    where: { name: 'Combo Sushi Cao Cấp' }
  })
  
  if (dish) {
    await prisma.dish.update({
      where: { id: dish.id },
      data: {
        image: 'http://localhost:4000/static/sushi_360_01.png',
        images360: images
      }
    })
    console.log(`Updated dish ${dish.name} with correct /static/ paths.`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
