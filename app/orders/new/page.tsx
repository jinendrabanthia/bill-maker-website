import OrderForm from '../order-form'
import { getProfile } from '@/app/profile/actions'

export default async function NewOrderPage() {
  const profile = await getProfile()

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-[#1B4B66]">Create New Order</h1>
      <OrderForm initialData={{ agency: profile?.default_agency || '' }} profile={profile} />
    </div>
  )
}
