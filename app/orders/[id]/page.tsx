import OrderForm from '../order-form'
import { getOrderWithItems } from '../actions'
import { getProfile } from '@/app/profile/actions'
import { notFound } from 'next/navigation'

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const order = await getOrderWithItems(params.id)
  const profile = await getProfile()

  if (!order) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-[#1B4B66]">View/Edit Order</h1>
      <OrderForm initialData={order} profile={profile} />
    </div>
  )
}
