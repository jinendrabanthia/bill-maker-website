import { getProfile } from './actions'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-[#1B4B66]">Company Profile</h1>
      <p className="text-gray-600 mb-8">
        This information will be used to auto-fill your bills. Fill this out once.
      </p>
      
      <ProfileForm initialData={profile || {}} />
    </div>
  )
}
