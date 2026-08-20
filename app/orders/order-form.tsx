'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveOrder } from './actions'
import { generatePDF, fileToBase64 } from '@/lib/pdf-generator'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2, PlusCircle, Upload, Save, FileDown, ArrowLeft } from 'lucide-react'

export default function OrderForm({ initialData = {}, profile }: { initialData?: any, profile: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Auto-generate PDF if URL has ?pdf=true
  useEffect(() => {
    if (searchParams.get('pdf') === 'true' && initialData.id) {
      setTimeout(() => {
        generatePDF(initialData, initialData.items || [], profile)
        toast.success('PDF downloaded')
      }, 500)
    }
  }, [searchParams, initialData, profile])

  // Order Details State
  const [order, setOrder] = useState({
    id: initialData.id,
    ref_name: initialData.ref_name || '',
    agency: initialData.agency || profile?.default_agency || '',
    order_form_no: initialData.order_form_no || '',
    order_date: initialData.order_date || new Date().toISOString().split('T')[0],
    advance_payment: initialData.advance_payment || 0,
    advance_mode: initialData.advance_mode || 'None',
    remark: initialData.remark || ''
  })

  // Order Items State
  const [items, setItems] = useState<any[]>(
    initialData.items?.length > 0 
      ? initialData.items 
      : [{ id: Date.now().toString(), code: '', qty: 1, net_price: 0, sizes: '', no_of_sizes: 0, grand_total: 0, file: null, product_image_url: null }]
  )

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setOrder(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value

    // Auto calculate no_of_sizes and grand_total
    if (field === 'sizes' || field === 'qty' || field === 'net_price') {
      const sizesArray = newItems[index].sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      newItems[index].no_of_sizes = sizesArray.length
      
      const qty = Number(newItems[index].qty) || 0
      const price = Number(newItems[index].net_price) || 0
      newItems[index].grand_total = qty * price * newItems[index].no_of_sizes
    }

    setItems(newItems)
  }

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newItems = [...items]
    newItems[index].file = file
    
    // Create base64 for PDF and thumbnail preview immediately
    try {
      newItems[index].base64Image = await fileToBase64(file)
      newItems[index].previewUrl = URL.createObjectURL(file)
    } catch (err) {
      console.error("Failed to read file", err)
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), code: '', qty: 1, net_price: 0, sizes: '', no_of_sizes: 0, grand_total: 0, file: null }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const uploadImages = async (orderId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const newItems = [...items]
    
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i]
      if (item.file) {
        const fileExt = item.file.name.split('.').pop()
        const fileName = `${Date.now()}_${i}.${fileExt}`
        const filePath = `${user.id}/${orderId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, item.file)

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        newItems[i].product_image_url = publicUrl
      }
    }
    
    return newItems
  }

  const handleSave = async (generatePdfAfter: boolean = false) => {
    try {
      if (generatePdfAfter) setIsGenerating(true)
      else setIsSaving(true)

      // Strip non-serializable objects (like File) before passing to Server Action
      const itemsForServer = items.map(({ file, base64Image, previewUrl, ...rest }) => rest)
      
      // 1. First save order without item images to get Order ID
      const saveRes = await saveOrder(order, itemsForServer)
      if (saveRes.error) throw new Error(saveRes.error)

      // 2. Upload images with Order ID
      let finalItems = items
      const hasNewFiles = items.some(i => !!i.file)
      
      if (hasNewFiles) {
        finalItems = await uploadImages(saveRes.orderId)
        // 3. Save order items again with image URLs
        const finalItemsForServer = finalItems.map(({ file, base64Image, previewUrl, ...rest }) => rest)
        await saveOrder({ ...order, id: saveRes.orderId }, finalItemsForServer)
      }

      toast.success('Order saved successfully')

      if (generatePdfAfter) {
        // Need to ensure all items have base64 format for jsPDF
        for (let item of finalItems) {
          if (!item.base64Image && item.product_image_url) {
            try {
              const response = await fetch(item.product_image_url)
              const blob = await response.blob()
              item.base64Image = await fileToBase64(blob as File)
            } catch(e) {
              console.error("Could not fetch image for PDF", e)
            }
          }
        }
        await generatePDF(order, finalItems, profile)
        toast.success('PDF generated')
        // We do NOT redirect after generating PDF so the browser doesn't interrupt the file download.
      } else {
        router.push('/dashboard')
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to save order')
    } finally {
      setIsSaving(false)
      setIsGenerating(false)
    }
  }

  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.no_of_sizes)), 0)
  const grandTotal = items.reduce((sum, item) => sum + Number(item.grand_total), 0)

  return (
    <div className="space-y-8 pb-20">
      {/* Section 1: Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#1B4B66]">1. Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ref_name">Reference Name *</Label>
            <Input id="ref_name" name="ref_name" value={order.ref_name} onChange={handleOrderChange} placeholder="e.g. Surat Dreams Aug 26" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agency">Agency</Label>
            <Input id="agency" name="agency" value={order.agency} onChange={handleOrderChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_form_no">Order Form No *</Label>
            <Input id="order_form_no" name="order_form_no" value={order.order_form_no} onChange={handleOrderChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_date">Order Date *</Label>
            <Input id="order_date" name="order_date" type="date" value={order.order_date} onChange={handleOrderChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="advance_payment">Advance Payment</Label>
            <Input id="advance_payment" name="advance_payment" type="number" value={order.advance_payment} onChange={handleOrderChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="advance_mode">Advance Mode</Label>
            <Input id="advance_mode" name="advance_mode" value={order.advance_mode} onChange={handleOrderChange} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="remark">Remark</Label>
            <Input id="remark" name="remark" value={order.remark} onChange={handleOrderChange} />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Product Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-[#1B4B66]">2. Product Line Items</CardTitle>
          <Button onClick={addItem} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md bg-gray-50/50">
                <div className="absolute -top-3 -left-3 bg-[#1B4B66] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label>Image</Label>
                  <div className="flex items-center gap-2">
                    {(item.previewUrl || item.product_image_url) ? (
                      <div className="w-12 h-12 border rounded overflow-hidden relative group">
                        <img src={item.previewUrl || item.product_image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 border border-dashed rounded flex items-center justify-center bg-gray-50 text-gray-400">
                        <Upload className="h-4 w-4" />
                      </div>
                    )}
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="text-xs w-full max-w-[120px]" 
                      onChange={(e) => handleFileChange(index, e)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Code *</Label>
                  <Input value={item.code} onChange={(e) => handleItemChange(index, 'code', e.target.value)} placeholder="e.g. 2037740 / #464" required />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Net Price *</Label>
                  <Input type="number" value={item.net_price} onChange={(e) => handleItemChange(index, 'net_price', e.target.value)} required />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label>Sizes (comma-separated) *</Label>
                  <Input value={item.sizes} onChange={(e) => handleItemChange(index, 'sizes', e.target.value)} placeholder="e.g. 38,40,42" required />
                  <p className="text-xs text-gray-500 text-right">Sizes count: {item.no_of_sizes}</p>
                </div>

                <div className="md:col-span-1 space-y-2">
                  <Label>Sets Qty</Label>
                  <Input type="number" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} />
                </div>

                <div className="md:col-span-2 flex flex-col justify-between pt-6 md:pt-0">
                  <div className="space-y-1 md:text-right mb-2">
                    <Label className="md:hidden block">Grand Total</Label>
                    <div className="text-lg font-bold text-[#1B4B66]">₹{item.grand_total.toLocaleString()}</div>
                  </div>
                  
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-red-500 md:ml-auto w-fit" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button onClick={addItem} variant="secondary" className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Summary */}
      <Card className="bg-[#1B4B66] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-blue-200 text-sm">Total Quantity</p>
              <p className="text-3xl font-bold">{totalQty} pcs</p>
            </div>
            
            <Separator orientation="vertical" className="hidden md:block h-12 bg-blue-400" />
            <Separator orientation="horizontal" className="md:hidden w-full bg-blue-400" />
            
            <div className="text-center md:text-right">
              <p className="text-blue-200 text-sm">Grand Total (Plus GST as Applicable)</p>
              <p className="text-4xl font-bold">₹{grandTotal.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex flex-col sm:flex-row justify-center sm:justify-end gap-4 md:px-8">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving || isGenerating}>
          {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Order</>}
        </Button>
        <Button className="bg-[#1B4B66] hover:bg-[#153a50]" onClick={() => handleSave(true)} disabled={isSaving || isGenerating}>
          {isGenerating ? 'Generating PDF...' : <><FileDown className="mr-2 h-4 w-4" /> Save & Generate PDF</>}
        </Button>
      </div>
    </div>
  )
}
