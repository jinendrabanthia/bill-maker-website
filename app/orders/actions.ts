'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveOrder(orderData: any, itemsData: any[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Calculate totals
  const totalQty = itemsData.reduce((sum, item) => sum + (Number(item.qty) * Number(item.no_of_sizes)), 0)
  const grandTotal = itemsData.reduce((sum, item) => sum + Number(item.grand_total), 0)

  // Upsert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .upsert({
      ...orderData,
      user_id: user.id,
      total_qty: totalQty,
      grand_total: grandTotal,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error saving order:', orderError)
    return { error: orderError.message }
  }

  // Delete existing items if updating
  if (orderData.id) {
    await supabase.from('order_items').delete().eq('order_id', orderData.id)
  }

  // Insert items
  const itemsToInsert = itemsData.map((item, index) => {
    const { id, ...rest } = item;
    return {
      ...rest,
      order_id: order.id,
      serial_no: index + 1
    }
  })

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Error saving order items:', itemsError)
    return { error: itemsError.message }
  }

  revalidatePath('/dashboard')
  
  return { success: true, orderId: order.id }
}

export async function getOrderWithItems(id: string) {
  const supabase = createClient()
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
    
  if (orderError) return null

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)
    .order('serial_no', { ascending: true })

  if (itemsError) return null

  return { ...order, items }
}
