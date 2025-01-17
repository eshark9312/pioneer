import React from 'react'

import { ButtonPrimary, ButtonsGroup } from '@/common/components/buttons'
import { FailureIcon } from '@/common/components/icons'
import { Modal, ModalBody, ModalFooterComponent, ModalHeader } from '@/common/components/Modal'

interface FallbackProps {
  error: Error
  resetErrorBoundary: (...args: Array<unknown>) => void
}

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <Modal modalSize="m" onClose={resetErrorBoundary}>
      <ModalHeader icon={<FailureIcon />} title="Something went wrong" onClick={resetErrorBoundary} />
      <ModalBody>
        <pre>{error.message}</pre>
      </ModalBody>
      <ModalFooterComponent>
        <ButtonsGroup align="right">
          <ButtonPrimary size="medium" onClick={resetErrorBoundary}>
            Try again
          </ButtonPrimary>
        </ButtonsGroup>
      </ModalFooterComponent>
    </Modal>
  )
}
