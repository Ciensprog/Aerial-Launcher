import { BasicInformation } from './-basic-information'
import { RewardsSummary } from './-rewards-summary'
import { SearchForm } from './-search-form'

export function AlertsDone() {
  return (
    <>
      <SearchForm />
      <BasicInformation />
      <RewardsSummary />
    </>
  )
}
