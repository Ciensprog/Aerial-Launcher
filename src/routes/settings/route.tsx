import { createRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'

import { Route as RootRoute } from '../__root'

import { HomeBreadcrumb } from '../../components/navigations/breadcrumb/home'
import { SeparatorWithTitle } from '../../components/ui/extended/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'

import { AccountCustomization } from './-account-customization/-index'
import { AppSettings } from './-app-settings/-index'
import { TagsManagement } from './-tags-management/-index'

import { useGetAccounts } from '../../hooks/accounts'

import { cn } from '../../lib/utils'

enum SettingsSections {
  AppSettings = 'app-settings',
  TagsManagement = 'tags-management',
  AccountCustomization = 'account-customization',
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/settings',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { accountsArray } = useGetAccounts()

  return (
    <div className="flex flex-grow">
      <div className="flex justify-center w-full">
        <div className="flex flex-col max-w-lg w-full">
          <Accordion
            className={cn(
              'space-y-2- w-full',
              '[&_.section-trigger[data-state=open]_.section-icon]:rotate-180',
              '[&_.section-title]:flex [&_.section-title]:gap-1.5 [&_.section-title]:items-center',
              '[&_.section-icon]:h-4 [&_.section-icon]:w-4 [&_.section-icon]:shrink-0 [&_.section-icon]:transition-transform [&_.section-icon]:duration-200',
              '[&_.section-content]:py-6'
            )}
            type="multiple"
            defaultValue={[SettingsSections.AccountCustomization]}
          >
            <AccordionItem
              className="border-none"
              value={SettingsSections.AppSettings}
            >
              <AccordionTrigger
                className="section-trigger"
                hideIcon
              >
                <SeparatorWithTitle className="section-title">
                  App Settings <ChevronDown className="section-icon" />
                </SeparatorWithTitle>
              </AccordionTrigger>
              <AccordionContent className="section-content">
                <AppSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              className="border-none"
              value={SettingsSections.TagsManagement}
            >
              <AccordionTrigger
                className="section-trigger"
                hideIcon
              >
                <SeparatorWithTitle className="section-title">
                  Tags Management <ChevronDown className="section-icon" />
                </SeparatorWithTitle>
              </AccordionTrigger>
              <AccordionContent className="section-content">
                <TagsManagement />
              </AccordionContent>
            </AccordionItem>

            {accountsArray.length > 0 && (
              <AccordionItem
                className="border-none"
                value={SettingsSections.AccountCustomization}
              >
                <AccordionTrigger
                  className="section-trigger"
                  hideIcon
                >
                  <SeparatorWithTitle className="section-title">
                    Account Customization{' '}
                    <ChevronDown className="section-icon" />
                  </SeparatorWithTitle>
                </AccordionTrigger>
                <AccordionContent className="section-content">
                  <AccountCustomization />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
