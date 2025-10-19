'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Employee {
  id: string
  name: string
  email: string
  position: string
  department?: string
}

interface PayslipFormProps {
  onSuccess?: () => void
}

export function PayslipForm({ onSuccess }: PayslipFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: new Date().toISOString().split('T')[0],
    basicSalary: '',
    houseAllowance: '',
    transportAllowance: '',
    otherEarnings: '',
    tax: '',
    insurance: '',
    pension: '',
    otherDeductions: '',
    notes: '',
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const payload = {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary) || 0,
        houseAllowance: parseFloat(formData.houseAllowance) || 0,
        transportAllowance: parseFloat(formData.transportAllowance) || 0,
        otherEarnings: parseFloat(formData.otherEarnings) || 0,
        tax: parseFloat(formData.tax) || 0,
        insurance: parseFloat(formData.insurance) || 0,
        pension: parseFloat(formData.pension) || 0,
        otherDeductions: parseFloat(formData.otherDeductions) || 0,
      }

      const response = await fetch('/api/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create payslip')
      }

      setSuccess(true)
      // Reset form
      setFormData({
        employeeId: '',
        payPeriodStart: '',
        payPeriodEnd: '',
        payDate: new Date().toISOString().split('T')[0],
        basicSalary: '',
        houseAllowance: '',
        transportAllowance: '',
        otherEarnings: '',
        tax: '',
        insurance: '',
        pension: '',
        otherDeductions: '',
        notes: '',
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const calculateTotals = () => {
    const earnings =
      parseFloat(formData.basicSalary || '0') +
      parseFloat(formData.houseAllowance || '0') +
      parseFloat(formData.transportAllowance || '0') +
      parseFloat(formData.otherEarnings || '0')

    const deductions =
      parseFloat(formData.tax || '0') +
      parseFloat(formData.insurance || '0') +
      parseFloat(formData.pension || '0') +
      parseFloat(formData.otherDeductions || '0')

    return {
      earnings: earnings.toFixed(2),
      deductions: deductions.toFixed(2),
      netPay: (earnings - deductions).toFixed(2),
    }
  }

  const totals = calculateTotals()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Payslip</CardTitle>
        <CardDescription>Create a new payslip for an employee</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
              Payslip created successfully!
            </div>
          )}

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee *</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) =>
                setFormData({ ...formData, employeeId: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payPeriodStart">Period Start *</Label>
              <Input
                type="date"
                id="payPeriodStart"
                name="payPeriodStart"
                value={formData.payPeriodStart}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payPeriodEnd">Period End *</Label>
              <Input
                type="date"
                id="payPeriodEnd"
                name="payPeriodEnd"
                value={formData.payPeriodEnd}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payDate">Pay Date *</Label>
              <Input
                type="date"
                id="payDate"
                name="payDate"
                value={formData.payDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Earnings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700">Earnings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basicSalary">Basic Salary *</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="basicSalary"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseAllowance">House Allowance</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="houseAllowance"
                  name="houseAllowance"
                  value={formData.houseAllowance}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportAllowance">Transport Allowance</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="transportAllowance"
                  name="transportAllowance"
                  value={formData.transportAllowance}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherEarnings">Other Earnings</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="otherEarnings"
                  name="otherEarnings"
                  value={formData.otherEarnings}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-700">Deductions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="tax"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="insurance"
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pension">Pension</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="pension"
                  name="pension"
                  value={formData.pension}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherDeductions">Other Deductions</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="otherDeductions"
                  name="otherDeductions"
                  value={formData.otherDeductions}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
            />
          </div>

          {/* Summary */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg mb-3">Summary</h3>
            <div className="flex justify-between">
              <span className="text-green-700">Total Earnings:</span>
              <span className="font-semibold">${totals.earnings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Total Deductions:</span>
              <span className="font-semibold">${totals.deductions}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-lg font-bold">Net Pay:</span>
              <span className="text-lg font-bold text-blue-600">
                ${totals.netPay}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Generate Payslip'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
