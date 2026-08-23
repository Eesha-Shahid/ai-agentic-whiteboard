import ProjectList from '@/components/custom/dashboard/ProjectList'
import WelcomeBanner from '@/components/custom/dashboard/WelcomeBanner'

function DashboardPage() {
  return (
    <div>
      <WelcomeBanner />
      <ProjectList />
    </div>
  )
}

export default DashboardPage