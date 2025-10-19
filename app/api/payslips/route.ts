import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { payslipSchema } from '@/lib/validations'
import { z } from 'zod'

// GET all payslips
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    const where = employeeId ? { employeeId } : {}

    const payslips = await prisma.payslip.findMany({
      where,
      orderBy: { payDate: 'desc' },
      include: {
        employee: true,
      },
    })

    return NextResponse.json(payslips)
  } catch (error) {
    console.error('Error fetching payslips:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payslips' },
      { status: 500 }
    )
  }
}

// POST create new payslip
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = payslipSchema.parse(body)

    // Convert string dates to Date objects
    const payPeriodStart = new Date(data.payPeriodStart)
    const payPeriodEnd = new Date(data.payPeriodEnd)
    const payDate = new Date(data.payDate)

    // Calculate totals
    const totalEarnings =
      data.basicSalary +
      data.houseAllowance +
      data.transportAllowance +
      data.otherEarnings

    const totalDeductions =
      data.tax +
      data.insurance +
      data.pension +
      data.otherDeductions

    const netPay = totalEarnings - totalDeductions

    const payslip = await prisma.payslip.create({
      data: {
        ...data,
        payPeriodStart,
        payPeriodEnd,
        payDate,
        totalEarnings,
        totalDeductions,
        netPay,
      },
      include: {
        employee: true,
      },
    })

    return NextResponse.json(payslip, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payslip:', error)
    return NextResponse.json(
      { error: 'Failed to create payslip' },
      { status: 500 }
    )
  }
}
