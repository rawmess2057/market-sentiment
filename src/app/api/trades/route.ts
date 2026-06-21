import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse(null, { status: 401 })

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ trades })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse(null, { status: 401 })

  try {
    const body = await request.json()
    if (!body.id) delete body.id

    const trade = await prisma.trade.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ trade })
  } catch (error) {
    console.error('[POST /api/trades]', error)
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 },
    )
  }
}
