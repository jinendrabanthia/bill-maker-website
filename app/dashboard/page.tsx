import { getOrders } from './actions'
import OrderTable from './order-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { getProfile } from '@/app/profile/actions'

export default async function DashboardPage() {
  const orders = await getOrders()
  const profile = await getProfile()

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1B4B66]">Dashboard</h1>
          <p className="text-gray-600">Manage your wholesale orders and bills.</p>
        </div>
        <Link href="/orders/new">
          <Button className="bg-[#1B4B66] hover:bg-[#153a50]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Order
          </Button>
        </Link>
      </div>

      {!profile && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
          <div className="flex justify-between items-center">
            <p className="text-amber-700">
              <span className="font-bold">⚠️ Profile Incomplete:</span> Please set up your company and supplier info to auto-fill bills.
            </p>
            <Link href="/profile">
              <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-100">
                Setup Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No orders found.</p>
            <Link href="/orders/new">
              <Button variant="outline">Create your first order</Button>
            </Link>
          </div>
        ) : (
          <OrderTable orders={orders} />
        )}
      </div>
    </div>
  )
}
