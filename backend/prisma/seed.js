import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@eventflow.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@eventflow.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@eventflow.com',
      password: hashedPassword,
      role: 'USER'
    }
  })

  console.log('Created users:', { admin: admin.email, user: user.email })

  const now = new Date()
  const events = [
    {
      title: 'Tech Conference 2024',
      description: 'Join us for the biggest tech conference of the year! Featuring keynotes from industry leaders, hands-on workshops, and networking opportunities with fellow developers.',
      category: 'Conference',
      location: 'San Francisco, CA - Moscone Center',
      eventDate: new Date(now.getFullYear(), now.getMonth() + 2, 15, 9, 0),
      ticketPrice: 299.99,
      totalSeats: 500,
      availableSeats: 500,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
    },
    {
      title: 'Summer Music Festival',
      description: 'Three days of amazing music from top artists across multiple stages. Food trucks, art installations, and unforgettable memories await!',
      category: 'Music',
      location: 'Austin, TX - Zilker Park',
      eventDate: new Date(now.getFullYear(), now.getMonth() + 1, 20, 14, 0),
      ticketPrice: 199.99,
      totalSeats: 1000,
      availableSeats: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
    },
    {
      title: 'React Workshop: Advanced Patterns',
      description: 'Deep dive into advanced React patterns including hooks, context, suspense, and server components. Hands-on coding sessions included.',
      category: 'Workshop',
      location: 'New York, NY - Tech Hub NYC',
      eventDate: new Date(now.getFullYear(), now.getMonth() + 3, 10, 10, 0),
      ticketPrice: 149.99,
      totalSeats: 50,
      availableSeats: 50,
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
    },
    {
      title: 'NBA Finals Game 7',
      description: 'Experience the excitement of Game 7 of the NBA Finals live! Two legendary teams battle for the championship.',
      category: 'Sports',
      location: 'Los Angeles, CA - Crypto.com Arena',
      eventDate: new Date(now.getFullYear(), now.getMonth() + 4, 5, 19, 30),
      ticketPrice: 499.99,
      totalSeats: 2000,
      availableSeats: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109748b08?w=800'
    },
    {
      title: 'Hamilton - Broadway Musical',
      description: 'The award-winning musical phenomenon! Experience the story of Alexander Hamilton through hip-hop, jazz, and R&B.',
      category: 'Theater',
      location: 'New York, NY - Richard Rodgers Theatre',
      eventDate: new Date(now.getFullYear(), now.getMonth() + 1, 28, 20, 0),
      ticketPrice: 189.99,
      totalSeats: 130,
      availableSeats: 130,
      imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'
    },
    {
      title: 'Food & Wine Festival',
      description: 'Taste the finest culinary creations from world-renowned chefs. Wine pairings, cooking demos, and gourmet tastings.',
      category: 'Food & Drink',
      location: 'Napa Valley, CA - Various Venues',
      eventDate: new Date(now.getFullYear(), now.getMonth() + 2, 1, 12, 0),
      ticketPrice: 249.99,
      totalSeats: 300,
      availableSeats: 300,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
    }
  ]

  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData
    })
    console.log(`Created event: ${event.title}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })