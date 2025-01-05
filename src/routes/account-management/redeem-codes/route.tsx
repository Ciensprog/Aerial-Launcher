import { createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '../../../components/ui/card'
import { Textarea } from '../../../components/ui/textarea'

import {
  RedeemCodesData,
  RedeemCodesStatus,
} from '../../../state/management/redeem-code'

import { useGetAccounts } from '../../../hooks/accounts'
import { useRedeemCodesData } from './-hooks'

import { cn, parseCustomDisplayName } from '../../../lib/utils'
import { useMemo } from 'react'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/redeem-codes',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'account-management',
    })

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('options.redeem-codes')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management'], {
    keyPrefix: 'redeem-codes',
  })

  const {
    accounts,
    codes,
    isDisabledForm,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    notifications,
    tags,

    handleClearForm,
    handleRedeem,
    handleUpdateCodes,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateTags,
  } = useRedeemCodesData()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="max-w-lg space-y-4 w-full">
          <Card className="w-full">
            <CardHeader className="border-b">
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
              <AccountSelectors
                accounts={{
                  options: accounts,
                  value: parsedSelectedAccounts,
                }}
                tags={{
                  options: tags,
                  value: parsedSelectedTags,
                }}
                onUpdateAccounts={redeemCodesUpdateAccounts}
                onUpdateTags={redeemCodesUpdateTags}
              />
              <Textarea
                className="[field-sizing:content] resize-none"
                placeholder={t('form.input.placeholder')}
                value={codes}
                onChange={handleUpdateCodes}
                disabled={isLoading}
              />
            </CardContent>
            <CardFooter className="flex gap-6 [&>.action]:max-w-[calc(50%-0.75rem)] [&>.action]:px-2 [&>.action]:w-full">
              <Button
                className="action"
                onClick={handleRedeem}
                disabled={isDisabledForm}
              >
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  <span className="truncate">
                    {t('form.redeem-button')}
                  </span>
                )}
              </Button>
              <Button
                className="action"
                onClick={handleClearForm}
                variant="secondary"
              >
                <span className="truncate">{t('form.clear-button')}</span>
              </Button>
            </CardFooter>
          </Card>

          <div className="max-w-lg mt-5 w-full">
            <Accordion
              className="flex flex-col gap-2"
              type="multiple"
            >
              {notifications.map((item) => (
                <ResponseItem
                  data={item}
                  key={item.account.accountId}
                />
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResponseItem({ data }: { data: RedeemCodesData }) {
  const { i18n, t } = useTranslation(['general'])

  const { accountList } = useGetAccounts()

  const statusesText = useMemo(
    () => ({
      [RedeemCodesStatus.ERROR]: t('statuses.error'),
      [RedeemCodesStatus.LOADING]: t('statuses.loading'),
      [RedeemCodesStatus.NOT_FOUND]: t('statuses.not-found'),
      [RedeemCodesStatus.OWNED]: t('statuses.owned'),
      [RedeemCodesStatus.SUCCESS]: t('statuses.claimed'),
      [RedeemCodesStatus.USED]: t('statuses.used'),
    }),
    [i18n.language]
  )

  const codes = Object.values(data.codes)
  const successCounter = codes.filter((code) =>
    [RedeemCodesStatus.OWNED, RedeemCodesStatus.SUCCESS].includes(
      code.status
    )
  ).length

  return (
    <AccordionItem
      className="border rounded"
      value={data.account.accountId}
    >
      <div className="flex items-center justify-center pr-3">
        <AccordionTrigger
          className={cn(
            'flex-none font-normal gap-1 px-4 py-2 w-full [&>svg]:ml-auto'
          )}
        >
          <span className="truncate max-w-52">
            {parseCustomDisplayName(accountList[data.account.accountId])}
          </span>
          <span>一</span>
          <span>
            {successCounter}/{codes.length}
          </span>
        </AccordionTrigger>
      </div>
      <AccordionContent className="flex flex-col gap-1- pt-4 px-4">
        {codes.map((code, index) => (
          <div
            className="flex gap-1"
            key={`${code.value}-${index}`}
          >
            <span className="font-bold">{code.value}:</span>
            <span
              className={cn(
                'border- font-bold px-2- py-0.5- rounded text-xs- uppercase-',
                {
                  'border-[#ff6868] text-[#ff6868]':
                    code.status === RedeemCodesStatus.ERROR,
                  'border-muted-foreground/60 text-muted-foreground/60':
                    code.status === RedeemCodesStatus.LOADING,
                  'border-gray-400 text-gray-400': [
                    RedeemCodesStatus.NOT_FOUND,
                    RedeemCodesStatus.USED,
                  ].includes(code.status),
                  'border-green-600 text-green-600': [
                    RedeemCodesStatus.OWNED,
                    RedeemCodesStatus.SUCCESS,
                  ].includes(code.status),
                }
              )}
            >
              {statusesText[code.status] ??
                statusesText[RedeemCodesStatus.ERROR]}
            </span>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}
