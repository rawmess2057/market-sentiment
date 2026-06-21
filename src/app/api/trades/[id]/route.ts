import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

async function getOwnedTrade(id: string, userId: string) {
  const trade = await prisma.trade.findUnique({ where: { id } })
  if (!trade || trade.userId !== userId) return null
  return trade
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse(null, { status: 401 })

  try {
    const { id } = await params
    const existing = await getOwnedTrade(id, session.user.id)
    if (!existing) return new NextResponse(null, { status: 404 })

    const body = await request.json()
    delete body.id
    delete body.userId

    const trade = await prisma.trade.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ trade })
  } catch (error) {
    console.error('[PUT /api/trades/:id]', error)
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse(null, { status: 401 })

  try {
    const { id } = await params
    const existing = await getOwnedTrade(id, session.user.id)
    if (!existing) return new NextResponse(null, { status: 404 })

    await prisma.trade.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/trades/:id]', error)
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 },
    )
  }
}
