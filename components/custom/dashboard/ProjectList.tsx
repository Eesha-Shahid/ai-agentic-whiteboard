'use client'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react'

function ProjectList() {
  const [projectList, setProjectList] = useState([]);

  return (
    <div>
      {projectList.length === 0 ? (
        // Empty State
        <div className='flex flex-col items-center p-10 border rounded-xl mt-10 gap-3'>
          <Image src="/folder.png" alt='Folder' width={62} height={62} />
          <h2 className='text-xl font-bold'>No Boards Found</h2>
          <p className='text-muted-foreground'>Create your first board to start brainstorming!</p>
          <Button>+ Create New Board</Button>
        </div>
      ) : 
        // Project List
        <div></div>
      }
    </div>
  )
}

export default ProjectList