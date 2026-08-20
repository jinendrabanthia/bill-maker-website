import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, PlusCircle, User, LogOut } from 'lucide-react'

export default async function Navbar() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-6 container mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-[#1B4B66]" />
          <span className="text-xl tracking-tight">Bill Maker</span>
        </Link>
        
        <div className="ml-auto flex items-center space-x-4 md:space-x-6">
          <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-black hidden sm:block">
            Dashboard
          </Link>
          <Link href="/orders/new" className="text-sm font-medium text-gray-700 hover:text-black hidden sm:block">
            New Order
          </Link>
          <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-black hidden sm:block">
            Profile
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden md:inline-block truncate max-w-[150px]">
              {user.email}
            </span>
            <form action={async () => {
              'use server'
              const supabase = createClient()
              await supabase.auth.signOut()
              redirect('/login')
            }}>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Mobile nav links */}
      <div className="flex sm:hidden border-t px-4 py-2 space-x-4 justify-around bg-gray-50">
        <Link href="/dashboard" className="flex flex-col items-center text-xs font-medium text-gray-600">
          <FileText className="h-5 w-5 mb-1" />
          Dashboard
        </Link>
        <Link href="/orders/new" className="flex flex-col items-center text-xs font-medium text-gray-600">
          <PlusCircle className="h-5 w-5 mb-1" />
          New
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-xs font-medium text-gray-600">
          <User className="h-5 w-5 mb-1" />
          Profile
        </Link>
      </div>
    </nav>
  )
}
