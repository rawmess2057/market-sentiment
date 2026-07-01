import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse(null, { status: 401 })

  const url = new URL(request.url)
  const journalId = url.searchParams.get('journalId')

  const where: Record<string, unknown> = { userId: session.user.id }
  if (journalId) where.journalId = journalId

  const trades = await prisma.trade.findMany({
    where,
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

    const { journalId, ...rest } = body
    const trade = await prisma.trade.create({
      data: {
        ...rest,
        userId: session.user.id,
        journalId: journalId || undefined,
      },
    })

    return NextResponse.json({ trade })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[POST /api/trades]', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    )
  }
}
