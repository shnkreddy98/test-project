import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PayslipData {
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

export function generatePayslipPDF(payslip: PayslipData) {
  const doc = new jsPDF()

  // Header
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(0, 0, 210, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text('PAYSLIP', 105, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.text('Employee Payment Statement', 105, 25, { align: 'center' })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Employee Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Employee Information', 14, 45)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const employeeInfo = [
    ['Name:', payslip.employee.name],
    ['Position:', payslip.employee.position],
    ['Email:', payslip.employee.email],
    ['Pay Period:', `${formatDate(payslip.payPeriodStart)} - ${formatDate(payslip.payPeriodEnd)}`],
    ['Pay Date:', formatDate(payslip.payDate)],
  ]

  let yPos = 52
  employeeInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 14, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 50, yPos)
    yPos += 7
  })

  // Earnings Table
  yPos += 8
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Earnings', 14, yPos)

  yPos += 5
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Amount']],
    body: [
      ['Basic Salary', `$${payslip.basicSalary.toFixed(2)}`],
      ['House Allowance', `$${payslip.houseAllowance.toFixed(2)}`],
      ['Transport Allowance', `$${payslip.transportAllowance.toFixed(2)}`],
      ['Other Earnings', `$${payslip.otherEarnings.toFixed(2)}`],
    ],
    foot: [['Total Earnings', `$${payslip.totalEarnings.toFixed(2)}`]],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] }, // Green
    footStyles: { fillColor: [220, 252, 231], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  })

  // Deductions Table
  yPos = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Deductions', 14, yPos)

  yPos += 5
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Amount']],
    body: [
      ['Tax', `$${payslip.tax.toFixed(2)}`],
      ['Insurance', `$${payslip.insurance.toFixed(2)}`],
      ['Pension', `$${payslip.pension.toFixed(2)}`],
      ['Other Deductions', `$${payslip.otherDeductions.toFixed(2)}`],
    ],
    foot: [['Total Deductions', `$${payslip.totalDeductions.toFixed(2)}`]],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] }, // Red
    footStyles: { fillColor: [254, 226, 226], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  })

  // Net Pay
  yPos = (doc as any).lastAutoTable.finalY + 10
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(14, yPos, 182, 20, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('NET PAY:', 20, yPos + 13)
  doc.text(`$${payslip.netPay.toFixed(2)}`, 190, yPos + 13, { align: 'right' })

  // Notes
  if (payslip.notes) {
    yPos += 30
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', 14, yPos)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const splitNotes = doc.splitTextToSize(payslip.notes, 180)
    doc.text(splitNotes, 14, yPos + 7)
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(9)
  doc.setTextColor(128, 128, 128)
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-US')} | Payslip ID: ${payslip.id.substring(0, 8)}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  )

  // Save PDF
  const fileName = `payslip_${payslip.employee.name.replace(/\s+/g, '_')}_${formatDate(payslip.payDate).replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}
