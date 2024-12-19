import { createRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import { CustomizableMenu } from './-customizable-menu/-index'
import { TagsManagement } from './-tags-management/-index'

import { useGetAccounts } from '../../hooks/accounts'

import { cn } from '../../lib/utils'

enum SettingsSections {
  AppSettings = 'app-settings',
  CustomizableMenu = 'customizable-menu',
  TagsManagement = 'tags-management',
  AccountCustomization = 'account-customization',
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/settings',
  component: () => {
    const { t } = useTranslation(['general'])

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('settings')} </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['settings'])

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
                  {t('app-settings.title')}{' '}
                  <ChevronDown className="section-icon" />
                </SeparatorWithTitle>
              </AccordionTrigger>
              <AccordionContent className="section-content">
                <AppSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              className="border-none"
              value={SettingsSections.CustomizableMenu}
            >
              <AccordionTrigger
                className="section-trigger"
                hideIcon
              >
                <SeparatorWithTitle className="section-title">
                  {t('custom-menu.title')}{' '}
                  <ChevronDown className="section-icon" />
                </SeparatorWithTitle>
              </AccordionTrigger>
              <AccordionContent className="section-content">
                <CustomizableMenu />
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
                  {t('tags-management.title')}{' '}
                  <ChevronDown className="section-icon" />
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
                    {t('account-customization.title')}{' '}
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
