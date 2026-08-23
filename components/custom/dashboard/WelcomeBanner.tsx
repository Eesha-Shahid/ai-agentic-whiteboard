'use client'
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs'
import { Sparkles } from 'lucide-react';
import CreateNewBoardDialog from './CreateNewBoardDialog';

function WelcomeBanner() {
  const { user } = useUser();
  return (
    <div>
      <div className='p-10 rounded-xl bg-gradient-to-r from-blue-200 to-purple-200'>
        <h2 className='text-2xl font-bold'>Welcome Back, {user?.fullName}</h2>
        <p>Bring Your Ideas to Life on infinite canvas</p>
      </div>

      <div className='flex items-center gap-2 mt-5'>
        <CreateNewBoardDialog />
        <Button variant="outline" size="lg"><Sparkles />AI Helper</Button>
      </div>
    </div>
  )
}

export default WelcomeBanner