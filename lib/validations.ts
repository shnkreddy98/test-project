import { z } from "zod"

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().optional(),
})

export const payslipSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  payPeriodStart: z.string().or(z.date()),
  payPeriodEnd: z.string().or(z.date()),
  payDate: z.string().or(z.date()),

  // Earnings
  basicSalary: z.number().min(0, 'Basic salary must be positive'),
  houseAllowance: z.number().min(0).default(0),
  transportAllowance: z.number().min(0).default(0),
  otherEarnings: z.number().min(0).default(0),

  // Deductions
  tax: z.number().min(0).default(0),
  insurance: z.number().min(0).default(0),
  pension: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),

  notes: z.string().optional(),
})

export type EmployeeInput = z.infer<typeof employeeSchema>
export type PayslipInput = z.infer<typeof payslipSchema>
