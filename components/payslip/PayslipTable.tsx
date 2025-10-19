'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generatePayslipPDF } from './PayslipPDF'

interface Payslip {
  id: string
  employee: {
    name: string
    position: string
    email: string
  }
  payPeriodStart: string
  payPeriodEnd: string
  payDate: string
  basicSalary: number
  houseAllowance: number
  transportAllowance: number
  otherEarnings: number
  tax: number
  insurance: number
  pension: number
  otherDeductions: number
  totalEarnings: number
  totalDeductions: number
  netPay: number
  notes?: string
}

interface PayslipTableProps {
  refreshTrigger?: number
}

export function PayslipTable({ refreshTrigger }: PayslipTableProps) {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayslips()
  }, [refreshTrigger])

  const fetchPayslips = async () => {
    try {
      const response = await fetch('/api/payslips')
      if (response.ok) {
        const data = await response.json()
        setPayslips(data)
      }
    } catch (error) {
      console.error('Error fetching payslips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payslip?')) {
      return
    }

    try {
      const response = await fetch(`/api/payslips/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPayslips(payslips.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting payslip:', error)
    }
  }

  const handleDownloadPDF = (payslip: Payslip) => {
    generatePayslipPDF(payslip)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading payslips...</p>
        </CardContent>
      </Card>
    )
  }

  if (payslips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>View and manage all generated payslips</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No payslips found. Generate your first payslip above.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payslip History</CardTitle>
        <CardDescription>
          {payslips.length} payslip{payslips.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead className="text-right">Total Earnings</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell className="font-medium">
                    {payslip.employee.name}
                  </TableCell>
                  <TableCell>{payslip.employee.position}</TableCell>
                  <TableCell>
                    {formatDate(payslip.payPeriodStart)} -{' '}
                    {formatDate(payslip.payPeriodEnd)}
                  </TableCell>
                  <TableCell>{formatDate(payslip.payDate)}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(payslip.totalEarnings)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(payslip.totalDeductions)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-blue-600">
                    {formatCurrency(payslip.netPay)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(payslip)}
                      >
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(payslip.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
