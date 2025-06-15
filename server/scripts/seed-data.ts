import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRegionsAndCities() {
  // Regions data
  const regionsData = [
    { name: 'Bishkek', nameRu: 'Бишкек', nameKg: 'Бишкек' },
    { name: 'Osh', nameRu: 'Ош', nameKg: 'Ош' },
    { name: 'Chuy', nameRu: 'Чуйская область', nameKg: 'Чүй облусу' },
    { name: 'Osh Region', nameRu: 'Ошская область', nameKg: 'Ош облусу' },
    { name: 'Jalal-Abad', nameRu: 'Джалал-Абадская область', nameKg: 'Жалал-Абад облусу' },
    { name: 'Issyk-Kul', nameRu: 'Иссык-Кульская область', nameKg: 'Ысык-Көл облусу' },
    { name: 'Naryn', nameRu: 'Нарынская область', nameKg: 'Нарын облусу' },
    { name: 'Talas', nameRu: 'Таласская область', nameKg: 'Талас облусу' },
    { name: 'Batken', nameRu: 'Баткенская область', nameKg: 'Баткен облусу' }
  ]

  // Cities data with their corresponding region names
  const citiesData = [
    // Bishkek
    { name: 'Bishkek', nameRu: 'Бишкек', nameKg: 'Бишкек', regionName: 'Bishkek' },
    
    // Osh
    { name: 'Osh', nameRu: 'Ош', nameKg: 'Ош', regionName: 'Osh' },
    
    // Chuy Region
    { name: 'Tokmok', nameRu: 'Токмок', nameKg: 'Токмок', regionName: 'Chuy' },
    { name: 'Kant', nameRu: 'Кант', nameKg: 'Кант', regionName: 'Chuy' },
    { name: 'Kara-Balta', nameRu: 'Кара-Балта', nameKg: 'Кара-Балта', regionName: 'Chuy' },
    { name: 'Taraz', nameRu: 'Тараз', nameKg: 'Тараз', regionName: 'Chuy' },
    
    // Osh Region
    { name: 'Uzgen', nameRu: 'Узген', nameKg: 'Үзөң', regionName: 'Osh Region' },
    { name: 'Kara-Suu', nameRu: 'Кара-Суу', nameKg: 'Кара-Суу', regionName: 'Osh Region' },
    { name: 'Nookat', nameRu: 'Ноокат', nameKg: 'Ноокат', regionName: 'Osh Region' },
    
    // Jalal-Abad Region
    { name: 'Jalal-Abad', nameRu: 'Джалал-Абад', nameKg: 'Жалал-Абад', regionName: 'Jalal-Abad' },
    { name: 'Tash-Komur', nameRu: 'Таш-Кумыр', nameKg: 'Таш-Көмүр', regionName: 'Jalal-Abad' },
    { name: 'Kerben', nameRu: 'Кербен', nameKg: 'Кербен', regionName: 'Jalal-Abad' },
    
    // Issyk-Kul Region
    { name: 'Karakol', nameRu: 'Каракол', nameKg: 'Каракол', regionName: 'Issyk-Kul' },
    { name: 'Balykchy', nameRu: 'Балыкчы', nameKg: 'Балыкчы', regionName: 'Issyk-Kul' },
    { name: 'Cholpon-Ata', nameRu: 'Чолпон-Ата', nameKg: 'Чолпон-Ата', regionName: 'Issyk-Kul' },
    
    // Naryn Region
    { name: 'Naryn', nameRu: 'Нарын', nameKg: 'Нарын', regionName: 'Naryn' },
    { name: 'At-Bashi', nameRu: 'Ат-Баши', nameKg: 'Ат-Баши', regionName: 'Naryn' },
    { name: 'Ak-Talaa', nameRu: 'Ак-Талаа', nameKg: 'Ак-Талаа', regionName: 'Naryn' },
    
    // Talas Region
    { name: 'Talas', nameRu: 'Талас', nameKg: 'Талас', regionName: 'Talas' },
    { name: 'Manas', nameRu: 'Манас', nameKg: 'Манас', regionName: 'Talas' },
    { name: 'Pokrovka', nameRu: 'Покровка', nameKg: 'Покровка', regionName: 'Talas' },
    
    // Batken Region
    { name: 'Batken', nameRu: 'Баткен', nameKg: 'Баткен', regionName: 'Batken' },
    { name: 'Kyzyl-Kiya', nameRu: 'Кызыл-Кия', nameKg: 'Кызыл-Кыя', regionName: 'Batken' },
    { name: 'Sulukta', nameRu: 'Сулюкта', nameKg: 'Сулюкта', regionName: 'Batken' }
  ]

  try {
    // Create regions
    for (const regionData of regionsData) {
      await prisma.region.upsert({
        where: { name: regionData.name },
        update: {},
        create: regionData
      })
    }

    // Create cities
    for (const cityData of citiesData) {
      const region = await prisma.region.findUnique({
        where: { name: cityData.regionName }
      })

      if (region) {
        await prisma.city.upsert({
          where: { 
            name_regionId: { 
              name: cityData.name, 
              regionId: region.id 
            } 
          },
          update: {},
          create: {
            name: cityData.name,
            nameRu: cityData.nameRu,
            nameKg: cityData.nameKg,
            regionId: region.id
          }
        })
      }
    }

    console.log('Regions and cities seeded successfully!')
  } catch (error) {
    console.error('Error seeding regions and cities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedRegionsAndCities().catch(console.error) 