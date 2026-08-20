'use client'

import { useState } from 'react'
import { updateProfile } from './actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ProfileForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await updateProfile(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile saved! This will auto-fill your bills.')
    }
  }

  return (
    <form action={onSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#1B4B66]">1. Your Company (Buyer Info)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="buyer_name">Company Name *</Label>
            <Input id="buyer_name" name="buyer_name" defaultValue={initialData?.buyer_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer_city">City *</Label>
            <Input id="buyer_city" name="buyer_city" defaultValue={initialData?.buyer_city} placeholder="e.g. Odisha, India" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer_mobile">Mobile *</Label>
            <Input id="buyer_mobile" name="buyer_mobile" defaultValue={initialData?.buyer_mobile} required />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#1B4B66]">2. Supplier Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="supplier_brand">Supplier Brand Name *</Label>
            <Input id="supplier_brand" name="supplier_brand" defaultValue={initialData?.supplier_brand} placeholder="e.g. READIPRINT FASHIONS" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier_phone">Supplier Phone</Label>
            <Input id="supplier_phone" name="supplier_phone" defaultValue={initialData?.supplier_phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier_email">Supplier Email</Label>
            <Input id="supplier_email" name="supplier_email" type="email" defaultValue={initialData?.supplier_email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier_gstin">Supplier GSTIN</Label>
            <Input id="supplier_gstin" name="supplier_gstin" defaultValue={initialData?.supplier_gstin} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier_website">Supplier Website</Label>
            <Input id="supplier_website" name="supplier_website" defaultValue={initialData?.supplier_website} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="supplier_address">Supplier Address</Label>
            <Textarea id="supplier_address" name="supplier_address" defaultValue={initialData?.supplier_address} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#1B4B66]">3. Default Order Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="default_agency">Default Agency</Label>
            <Input id="default_agency" name="default_agency" defaultValue={initialData?.default_agency} placeholder="e.g. JM Jain" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-[#1B4B66] hover:bg-[#153a50] px-8">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}
