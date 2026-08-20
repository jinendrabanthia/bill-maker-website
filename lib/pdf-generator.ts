import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

export const generatePDF = async (orderData: any, items: any[], profile: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()

  // Fonts & styles
  doc.setFont('helvetica')

  // --- HEADER SECTION ---

  // LEFT BLOCK (Buyer & Order details)
  const leftX = 14
  let leftY = 15

  // Buyer Name (Large Bold)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(profile?.buyer_name || 'BUYER NAME', leftX, leftY)
  leftY += 6

  // Buyer City & Mobile
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`City: ${profile?.buyer_city || ''}    Mobile: ${profile?.buyer_mobile || ''}`, leftX, leftY)
  leftY += 6

  // Order Details
  doc.text(`Ref: ${orderData.ref_name || ''}    Agency: ${orderData.agency || ''}`, leftX, leftY)
  leftY += 6
  doc.text(`Order Form No: ${orderData.order_form_no || ''}    Order Date: ${orderData.order_date ? format(new Date(orderData.order_date), 'dd-MMM-yy') : ''}`, leftX, leftY)
  leftY += 6
  doc.text(`Advance Payment: ${orderData.advance_payment || '0'}    Advance Mode: ${orderData.advance_mode || 'None'}`, leftX, leftY)
  leftY += 6
  doc.text(`Print Date: ${format(new Date(), 'dd-MMM-yy HH:mm')}    Remark: ${orderData.remark || ''}`, leftX, leftY)

  // RIGHT BLOCK (Supplier details)
  const rightMargin = pageWidth - 14
  let rightY = 15

  // Supplier Brand
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  const supplierBrand = (profile?.supplier_brand || 'SUPPLIER BRAND').toUpperCase()
  doc.text(supplierBrand, rightMargin, rightY, { align: 'right' })
  rightY += 6

  if (supplierBrand.includes('READIPRINT')) {
    doc.setFontSize(12)
    doc.text('F A S H I O N S', rightMargin, rightY, { align: 'right' })
    rightY += 6
  }

  // Supplier Address & Contact
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (profile?.supplier_address) {
    const splitAddress = doc.splitTextToSize(profile.supplier_address, 80)
    doc.text(splitAddress, rightMargin, rightY, { align: 'right' })
    rightY += splitAddress.length * 4.5
  }
  
  if (profile?.supplier_phone) {
    doc.text(`phone: ${profile.supplier_phone}`, rightMargin, rightY, { align: 'right' })
    rightY += 4.5
  }
  if (profile?.supplier_email) {
    doc.text(`e-mail: ${profile.supplier_email}`, rightMargin, rightY, { align: 'right' })
    rightY += 4.5
  }
  if (profile?.supplier_gstin) {
    doc.text(`GSTIN: ${profile.supplier_gstin}`, rightMargin, rightY, { align: 'right' })
    rightY += 4.5
  }
  if (profile?.supplier_website) {
    doc.text(`website: ${profile.supplier_website}`, rightMargin, rightY, { align: 'right' })
    rightY += 4.5
  }

  // Draw Horizontal Rule
  const maxHeaderY = Math.max(leftY, rightY) + 4
  doc.setDrawColor(200, 200, 200)
  doc.line(14, maxHeaderY, pageWidth - 14, maxHeaderY)

  // --- PRODUCT TABLE ---
  
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.no_of_sizes)), 0)
  const grandTotal = items.reduce((sum, item) => sum + Number(item.grand_total), 0)

  autoTable(doc, {
    startY: maxHeaderY + 6,
    head: [['S No', 'Product', 'Code', 'Qty', 'Net Price', 'No Of Sizes', 'Grand Total']],
    body: items.map((item, idx) => [
      idx + 1,
      '', // Placeholder for image
      item.code,
      item.qty,
      item.net_price,
      `${item.no_of_sizes}\n\n${item.sizes}`,
      item.grand_total
    ]),
    foot: [['', '', '', '', '', `Total Qty: ${totalQty}`, `Grand Total: ${grandTotal}\nPlus GST as\nApplicable`]],
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      fontStyle: 'normal',
      halign: 'center',
    },
    bodyStyles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'center', cellWidth: 35 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      fontStyle: 'bold',
      halign: 'left',
    },
    didParseCell: (data) => {
      // Set a larger min height for rows so images fit properly
      if (data.section === 'body' && data.column.index === 1) {
        data.cell.styles.minCellHeight = 60
      }
    },
    didDrawCell: (data) => {
      // Handle Image rendering
      if (data.section === 'body' && data.column.index === 1 && items[data.row.index].base64Image) {
        try {
          const imgData = items[data.row.index].base64Image
          const cellWidth = data.cell.width
          const cellHeight = data.cell.height
          // Center the image in the cell, making it almost as wide as the cell
          const imgWidth = cellWidth - 4
          const imgHeight = cellHeight - 4
          const x = data.cell.x + 2
          const y = data.cell.y + 2
          doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
        } catch (e) {
          console.error("Failed to add image to PDF", e)
        }
      }
    },
    styles: {
      cellPadding: 3,
      fontSize: 10,
      valign: 'middle'
    }
  })

  // Export PDF
  const ref = orderData.ref_name?.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '_') || 'Order'
  const dateStr = format(new Date(), 'dd-MMM-yy')
  const filename = `${ref}_${dateStr}.pdf`
  
  const pdfBlob = doc.output('blob')
  
  try {
    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'PDF Document',
          accept: {'application/pdf': ['.pdf']},
        }],
      })
      const writable = await handle.createWritable()
      await writable.write(pdfBlob)
      await writable.close()
    } else {
      doc.save(filename)
    }
  } catch (err: any) {
    // User might have cancelled the save prompt
    if (err.name !== 'AbortError') {
      console.error("Save file error:", err)
      doc.save(filename) // Fallback
    }
  }
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
