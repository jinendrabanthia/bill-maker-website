'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { deleteOrder } from './actions'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, FileDown, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function OrderTable({ orders }: { orders: any[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const res = await deleteOrder(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Order deleted successfully')
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Date</TableHead>
              <TableHead>Ref Name</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Form No</TableHead>
              <TableHead className="text-right">Total Qty</TableHead>
              <TableHead className="text-right">Grand Total</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{format(new Date(order.order_date), 'dd-MMM-yy')}</TableCell>
                <TableCell className="font-medium">{order.ref_name}</TableCell>
                <TableCell>{order.agency}</TableCell>
                <TableCell>{order.order_form_no}</TableCell>
                <TableCell className="text-right">{order.total_qty}</TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{order.grand_total?.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center gap-2">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="icon" title="View/Edit">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                    </Link>
                    <Link href={`/orders/${order.id}?pdf=true`}>
                      <Button variant="ghost" size="icon" title="Generate PDF">
                        <FileDown className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Delete"
                      onClick={() => setDeleteId(order.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the order and all its items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
