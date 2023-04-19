import React, { useState, useEffect, EventHandler } from 'react'

import { PageHeader } from '@/app/components/PageHeader'
import { PageLayout } from '@/app/components/PageLayout'
import { SettingsTabs } from './components/SettingsTabs'
import { EmptyPagePlaceholder } from '@/common/components/EmptyPagePlaceholder/EmptyPagePlaceholder'
import { TransactionButton } from '@/common/components/buttons/TransactionButton'

import { useMyMemberships } from '@/memberships/hooks/useMyMemberships'
import { ColumnGapBlock, MainPanel, RowGapBlock } from '@/common/components/page/PageContent'
import { InputComponent, InputText, ToggleCheckbox } from '@/common/components/forms'
import { TextBig, TextMedium } from '@/common/components/typography'
import { useToggle } from '@/common/hooks/useToggle'
import { SettingsInformation } from '@/common/components/SettingsInformation'
import { InfoBannerIcon } from './components/InfoBannerIcon'
import { InformationBanner } from './components/InformationBanner'
import { GenerateNewLinkButton } from './components/GenerateNewLinkButton'
import { SaveChangesButton } from './components/SaveChangesButton'

export const EmailNotifications = () => {
  const { members, active, hasMembers } = useMyMemberships()
  // The informations related to notification setttings like EmailAddress
  //   can be in the MembershipsContext
  /*
  const { email, verified, notifyset } = active.email
 */
  ///////////////////////////////////////////////////////////////////////       mock      /////////////////
  const { email, verified, notifyset } = { email: null, verified: true, notifyset: true }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [subscribed, setSubscribed] = useState(!!email)
  const [_email, setEmail] = useState(email ?? '')
	
  type InputEmailState = 'verified' | 'unverified' | 'active'
  const initState = !email ? 'active' : verified ? 'verified' : 'unverified'
  const [emailState, changeEmailState] = useState<InputEmailState>(initState)
	
  const [notifiedCheck, setNotifiedCheck] = useToggle(notifyset)

  const [saveBtnEnabled, setSaveBtnEnabled] = useState(true)

  const subscribe = () => {
    let inputstr
    !hasMembers
      ? (alert('here openModal function comes'), //here openModal function comes
        (inputstr = prompt('Email notifications verify modal', 'default@email.com')), //here email verify modal comes
        setEmail(inputstr ?? ''))
      : ((inputstr = prompt('Email notifications verify modal', 'default@email.com')), //here email verify modal comes
        setEmail(inputstr ?? ''))
    setSubscribed(true)
  }

  const inputEmailChange = (e: any) => {
    changeEmailState(e.target.value == email ? initState : 'active')
    setEmail(e.target.value)
  }

	const saveChanges = () => {
    alert('All changes are saved successfully') //Here SaveFunctions comes
    //state true
  }
	
  useEffect(() => {
    if (!notifiedCheck) {
      setSaveBtnEnabled(true)
      return
    }
    setSaveBtnEnabled(!!_email ?? false)
  })
	
  return (
    <PageLayout
      header={
        <PageHeader
          title="Settings"
          tabs={<SettingsTabs />}
          buttons={<SaveChangesButton disabled={!saveBtnEnabled} saveChanges={saveChanges} />}
        />
      }
      main={
        !subscribed ? (
          <EmptyPagePlaceholder
            title="Subscribe to email notifications"
            copy="We use your email only to send you important notifications.
      You can customize what kind of notifications you receive anytime in settings."
            button={
              <TransactionButton style="primary" size="medium" onClick={subscribe}>
                Subscribe
              </TransactionButton>
            }
          />
        ) : (
          <MainPanel>
            <RowGapBlock gap={16}>
              <ColumnGapBlock gap={12}>
                <TextBig value bold>
                  I want to be notified by email:
                </TextBig>
                <ToggleCheckbox
                  name="Notification setting checktoggle"
                  trueLabel={notifiedCheck ? <TextMedium bold>Yes</TextMedium> : <TextMedium>Yes</TextMedium>}
                  falseLabel={notifiedCheck ? <TextMedium>No</TextMedium> : <TextMedium bold>No</TextMedium>}
                  checked={notifiedCheck}
                  onChange={setNotifiedCheck}
                />
              </ColumnGapBlock>
              <InputComponent inputSize="l" label="Email">
                <InputText value={_email} placeholder="Add email for notifications here" onChange={inputEmailChange} />
              </InputComponent>
              {emailState === 'verified' && (
                <SettingsInformation
                  icon={<InfoBannerIcon />}
                  title="Your email will never be shared and does not go on chain"
                >
                  <TextMedium lighter>
                    We use your email only to send you important notifications. You can change this email or opt out
                    from anytime in settings.
                  </TextMedium>
                </SettingsInformation>
              )}
              {emailState === 'unverified' && (
                <InformationBanner
                  icon={<InfoBannerIcon />}
                  title="Verify your email account with a link in a message we sent you"
                  button={<GenerateNewLinkButton />}
                  footer="Next link can be generated in 30 min..."
                >
                  <TextMedium lighter>
                    We sent a link to your email account that you have to use to verify. If you don't see any message
                    from us checkthe spam folder, if you cannot find the message you can generate a new link.
                  </TextMedium>
                </InformationBanner>
              )}
              {emailState === 'active' && !!_email && (
                <InformationBanner
                  icon={<InfoBannerIcon />}
                  title="Your email will never be shared and does not go on chain"
                  button={<GenerateNewLinkButton />}
                  footer="Check your email. Next link can be generated in 30 min"
                >
                  <TextMedium lighter>
                    We use your email only to send you important notifications. You can change this email or opt out
                    from anytime in settings.
                  </TextMedium>
                </InformationBanner>
              )}
            </RowGapBlock>
          </MainPanel>
        )
      }
    />
  )
}
