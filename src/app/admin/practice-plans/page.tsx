import { getPracticePlans } from '@/app/actions/practice'
import PracticePlanBuilder from '@/components/admin/PracticePlanBuilder'
import AdminPlanList from '@/components/admin/AdminPlanList'

export default async function AdminPracticePlansPage() {
  const plans = await getPracticePlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Practice Plans</h1>
      </div>
      <PracticePlanBuilder />
      <AdminPlanList plans={plans} />
    </div>
  )
}
