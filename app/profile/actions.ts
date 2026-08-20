'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return profile
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const profileData = {
    user_id: user.id,
    buyer_name: formData.get('buyer_name') as string,
    buyer_city: formData.get('buyer_city') as string,
    buyer_mobile: formData.get('buyer_mobile') as string,
    
    supplier_brand: formData.get('supplier_brand') as string,
    supplier_address: formData.get('supplier_address') as string,
    supplier_phone: formData.get('supplier_phone') as string,
    supplier_email: formData.get('supplier_email') as string,
    supplier_gstin: formData.get('supplier_gstin') as string,
    supplier_website: formData.get('supplier_website') as string,
    
    default_agency: formData.get('default_agency') as string,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'user_id' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/orders/new')
  
  return { success: true }
}
