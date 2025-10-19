import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET single payslip by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payslip = await prisma.payslip.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
      },
    })

    if (!payslip) {
      return NextResponse.json(
        { error: 'Payslip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payslip)
  } catch (error) {
    console.error('Error fetching payslip:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payslip' },
      { status: 500 }
    )
  }
}

// DELETE payslip by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.payslip.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Payslip deleted successfully' })
  } catch (error) {
    console.error('Error deleting payslip:', error)
    return NextResponse.json(
      { error: 'Failed to delete payslip' },
      { status: 500 }
    )
  }
}
