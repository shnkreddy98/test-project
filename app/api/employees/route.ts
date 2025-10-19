import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { employeeSchema } from '@/lib/validations'
import { z } from 'zod'

// GET all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { payslips: true }
        }
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST create new employee
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = employeeSchema.parse(body)

    const employee = await prisma.employee.create({
      data,
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
