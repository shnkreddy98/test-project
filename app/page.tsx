'use client'

import { useState } from 'react'
import { PayslipForm } from '@/components/payslip/PayslipForm'
import { PayslipTable } from '@/components/payslip/PayslipTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
  })

  const handlePayslipSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeFormData),
      })

      if (response.ok) {
        setEmployeeFormData({ name: '', email: '', position: '', department: '' })
        setShowEmployeeForm(false)
        alert('Employee added successfully!')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Failed to add employee')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Payslip Generator
              </h1>
              <p className="text-gray-600 mt-1">
                Generate and manage employee payslips
              </p>
            </div>
            <Button
              onClick={() => setShowEmployeeForm(!showEmployeeForm)}
              variant="outline"
            >
              {showEmployeeForm ? 'Hide' : 'Add'} Employee
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Add Employee Form */}
        {showEmployeeForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Employee</CardTitle>
              <CardDescription>
                Create an employee profile before generating payslips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={employeeFormData.name}
                      onChange={(e) =>
                        setEmployeeFormData({
                          ...employeeFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={employeeFormData.email}
                      onChange={(e) =>
                        setEmployeeFormData({
                          ...employeeFormData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={employeeFormData.position}
                      onChange={(e) =>
                        setEmployeeFormData({
                          ...employeeFormData,
                          position: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={employeeFormData.department}
                      onChange={(e) =>
                        setEmployeeFormData({
                          ...employeeFormData,
                          department: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button type="submit">Add Employee</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payslip Generation Form */}
        <PayslipForm onSuccess={handlePayslipSuccess} />

        {/* Payslip History Table */}
        <PayslipTable refreshTrigger={refreshTrigger} />
      </div>
    </main>
  )
}
