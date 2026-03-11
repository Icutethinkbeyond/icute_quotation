import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const constructionCategories = [
  { name: 'งานโครงสร้าง', desc: 'ปูน, เหล็ก, อิฐ, หิน, ทราย' },
  { name: 'งานไฟฟ้า', desc: 'สายไฟ, ท่อร้อยสาย, สวิตช์, เต้ารับ, โคมไฟ' },
  { name: 'งานประปาและสุขาภิบาล', desc: 'ท่อ PVC, ก๊อกน้ำ, อ่างล้างหน้า, ชักโครก' },
  { name: 'งานสีและเคมีภัณฑ์', desc: 'สีทาภายนอก, สีทาภายใน, ปูนยาแนว, กาวซีเมนต์' },
  { name: 'งานฝ้าและผนัง', desc: 'แผ่นยิปซั่ม, โครงคร่าว, สมาร์ทบอร์ด' },
  { name: 'งานหลังคา', desc: 'กระเบื้องหลังคา, เชิงชาย, แผ่นสะท้อนความร้อน' },
  { name: 'เครื่องมือช่าง', desc: 'สว่าน, เลื่อย, ค้อน, ตลับเมตร' }
]

const units = ['ถุง', 'เส้น', 'ท่อน', 'ชุด', 'แกลลอน', 'ตารางเมตร', 'ลูกบาศก์เมตร', 'กล่อง', 'ม้วน', 'อัน', 'เครื่อง']

const productTemplates: Record<string, any[]> = {
  'งานโครงสร้าง': [
    { name: 'ปูนซีเมนต์ปอร์ตแลนด์ ประเภท 1', unit: 'ถุง', price: [145, 175] },
    { name: 'เหล็กเส้นกลม SR24 ขนาด 9 มม.', unit: 'เส้น', price: [110, 130] },
    { name: 'เหล็กข้ออ้อย SD40 ขนาด 12 มม.', unit: 'เส้น', price: [210, 250] },
    { name: 'อิฐมวลเบา ขนาด 7.5 ซม.', unit: 'ก้อน', price: [18, 25] },
    { name: 'อิฐมอญรู ขนาดมาตรฐาน', unit: 'พาเลท', price: [1200, 1500] },
    { name: 'ทรายหยาบ สำหรับงานโครงสร้าง', unit: 'ลูกบาศก์เมตร', price: [450, 550] },
    { name: 'หิน 3/4 สำหรับงานคอนกรีต', unit: 'ลูกบาศก์เมตร', price: [400, 500] }
  ],
  'งานไฟฟ้า': [
    { name: 'สายไฟ THW 1x1.5 sq.mm.', unit: 'ม้วน', price: [450, 600] },
    { name: 'สายไฟ VAF 2x2.5 sq.mm.', unit: 'ม้วน', price: [1200, 1500] },
    { name: 'ท่อร้อยสายไฟ PVC สีเหลือง ขนาด 1/2 นิ้ว', unit: 'ท่อน', price: [35, 50] },
    { name: 'กล่องพักสายไฟ พลาสติก 4x4 นิ้ว', unit: 'อัน', price: [15, 25] },
    { name: 'สวิตช์ไฟทางเดียว สีขาว', unit: 'ชุด', price: [45, 85] },
    { name: 'เต้ารับคู่มีกราวด์ สีขาว', unit: 'ชุด', price: [120, 180] },
    { name: 'โคมไฟดาวน์ไลท์ LED 9W', unit: 'ชุด', price: [150, 250] }
  ],
  'งานประปาและสุขาภิบาล': [
    { name: 'ท่อ PVC สีฟ้า ชั้น 8.5 ขนาด 1/2 นิ้ว', unit: 'ท่อน', price: [45, 65] },
    { name: 'ท่อ PVC สีฟ้า ชั้น 8.5 ขนาด 1 นิ้ว', unit: 'ท่อน', price: [85, 120] },
    { name: 'ก๊อกน้ำอ่างล้างหน้า สแตนเลส 304', unit: 'อัน', price: [450, 850] },
    { name: 'ฝักบัวอาบน้ำ สายอ่อน', unit: 'ชุด', price: [350, 750] },
    { name: 'ชักโครกแบบชิ้นเดียว ประหยัดน้ำ', unit: 'ชุด', price: [3500, 7500] },
    { name: 'อ่างล้างหน้าแบบแขวนผนัง', unit: 'ชุด', price: [1200, 2500] },
    { name: 'สะดืออ่างล้างหน้า แบบกด', unit: 'อัน', price: [150, 300] }
  ],
  'งานสีและเคมีภัณฑ์': [
    { name: 'สีทาภายนอก กึ่งเงา ขนาด 5 แกลลอน', unit: 'ถัง', price: [2500, 3500] },
    { name: 'สีทาภายใน ชนิดด้าน ขนาด 5 แกลลอน', unit: 'ถัง', price: [1800, 2800] },
    { name: 'น้ำยาประสานคอนกรีต', unit: 'แกลลอน', price: [450, 650] },
    { name: 'กาวซีเมนต์ ปูกระเบื้องทั่วไป', unit: 'ถุง', price: [145, 220] },
    { name: 'กาวยาแนว กันเชื้อรา', unit: 'ถุง', price: [35, 65] },
    { name: 'น้ำยากันซึม สำหรับดาดฟ้า', unit: 'แกลลอน', price: [850, 1200] }
  ],
  'งานฝ้าและผนัง': [
    { name: 'แผ่นยิปซั่มบอร์ด หนา 9 มม.', unit: 'แผ่น', price: [145, 185] },
    { name: 'แผ่นยิปซั่มทนชื้น หนา 9 มม.', unit: 'แผ่น', price: [210, 260] },
    { name: 'โครงคร่าวซีลายน์ (C-Line) No.24', unit: 'เส้น', price: [45, 65] },
    { name: 'สมาร์ทบอร์ด หนา 6 มม.', unit: 'แผ่น', price: [185, 235] },
    { name: 'ปูนฉาบรอยต่อยิปซั่ม', unit: 'ถุง', price: [120, 180] }
  ],
  'งานหลังคา': [
    { name: 'กระเบื้องหลังคาลอนคู่ สีมาตรฐาน', unit: 'แผ่น', price: [55, 75] },
    { name: 'ครอบสันหลังคา ตัวยู', unit: 'แผ่น', price: [85, 120] },
    { name: 'แผ่นสะท้อนความร้อน อลูมิเนียมฟอยล์', unit: 'ม้วน', price: [850, 1200] },
    { name: 'รางน้ำฝน ไวนิล ขนาดมาตรฐาน', unit: 'เส้น', price: [450, 650] },
    { name: 'แผ่นปิดกันนก ลอนคู่', unit: 'เส้น', price: [25, 45] }
  ],
  'เครื่องมือช่าง': [
    { name: 'สว่านกระแทกไร้สาย 18V', unit: 'เครื่อง', price: [2500, 4500] },
    { name: 'เครื่องเจียรไฟฟ้า 4 นิ้ว', unit: 'เครื่อง', price: [1200, 2200] },
    { name: 'เลื่อยวงเดือน 7 นิ้ว', unit: 'เครื่อง', price: [2800, 3800] },
    { name: 'ตลับเมตร 5 เมตร หุ้มยาง', unit: 'อัน', price: [120, 250] },
    { name: 'ระดับน้ำ อลูมิเนียม 24 นิ้ว', unit: 'อัน', price: [350, 650] },
    { name: 'ค้อนหงอน เหล็กเหนียว', unit: 'อัน', price: [250, 450] }
  ]
}

async function main() {
  console.log('🚀 Starting construction product seed...')

  // 1. Create Categories
  for (const cat of constructionCategories) {
    const existingCat = await prisma.category.findFirst({
      where: { categoryName: cat.name }
    })

    let categoryId = existingCat?.categoryId

    if (!existingCat) {
      const newCat = await prisma.category.create({
        data: {
          categoryName: cat.name,
          categoryDesc: cat.desc
        }
      })
      categoryId = newCat.categoryId
      console.log(`✅ Created category: ${cat.name}`)
    }

    // 2. Create Products for this category
    const products = productTemplates[cat.name] || []
    for (const p of products) {
      const sku = `CON-${cat.name.substring(0, 2)}-${faker.string.alphanumeric(5).toUpperCase()}`
      
      const existingProduct = await prisma.product.findFirst({
        where: { productName: p.name }
      })

      if (!existingProduct) {
        const price = faker.number.float({ min: p.price[0], max: p.price[1], fractionDigits: 2 })
        
        await prisma.product.create({
          data: {
            productName: p.name,
            productSKU: sku,
            productDescription: `${p.name} คุณภาพมาตรฐานสำหรับงานก่อสร้าง`,
            categoryId: categoryId,
            aboutProduct: {
              create: {
                productPrice: price,
                productStock: faker.number.int({ min: 10, max: 100 }),
                productBrand: faker.helpers.arrayElement(['SCG', 'TPI', 'TOA', 'Diamond', 'Makita', 'Bosch', 'Generic']),
                unitName: p.unit
              }
            }
          }
        })
        console.log(`   📦 Created product: ${p.name} (${price} THB)`)
      }
    }
  }

  // 3. Create standalone Units in the new Unit table
  console.log('🚀 Creating units...')
  for (const unit of units) {
    const existingUnit = await prisma.unit.findUnique({
      where: { unitName: unit }
    })
    if (!existingUnit) {
      await prisma.unit.create({
        data: { unitName: unit }
      })
      console.log(`✅ Created unit: ${unit}`)
    }
  }

  console.log('✨ Construction product seed complete!')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
