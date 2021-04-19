import React, { useState } from 'react'

import { useAccounts } from '../../../accounts/hooks/useAccounts'
import { FailureModal } from '../../../common/components/FailureModal'
import { WithNullableValues } from '../../../common/types/form'
import { Member } from '../../types'

import { UpdateMemberForm } from './types'
import { UpdateMembershipFormModal } from './UpdateMembershipFormModal'
import { UpdateMembershipSignModal } from './UpdateMembershipSignModal'
import { UpdateMembershipSuccessModal } from './UpdateMembershipSuccessModal'

interface MembershipModalProps {
  member: Member
  onClose: () => void
}

type ModalState = 'PREPARE' | 'AUTHORIZE' | 'SUCCESS' | 'ERROR'

export const UpdateMembershipModal = ({ onClose, member }: MembershipModalProps) => {
  const [step, setStep] = useState<ModalState>('PREPARE')
  const [transactionParams, setParams] = useState<WithNullableValues<UpdateMemberForm>>()
  const { allAccounts } = useAccounts()
  const signer = allAccounts.find((account) => member.controllerAccount === account.address)

  const onSubmit = (params: WithNullableValues<UpdateMemberForm>) => {
    setStep('AUTHORIZE')
    setParams(params)
  }

  const onDone = (result: boolean) => setStep(result ? 'SUCCESS' : 'ERROR')

  if (step === 'PREPARE' || !transactionParams || !signer) {
    return <UpdateMembershipFormModal onClose={onClose} onSubmit={onSubmit} member={member} />
  }

  if (step === 'AUTHORIZE') {
    return (
      <UpdateMembershipSignModal
        onClose={onClose}
        transactionParams={transactionParams}
        member={member}
        signer={signer}
        onDone={onDone}
      />
    )
  }

  if (step === 'SUCCESS') {
    return <UpdateMembershipSuccessModal onClose={onClose} member={member} />
  }

  return <FailureModal onClose={onClose}>There was a problem updating membership for {member.name}.</FailureModal>
}