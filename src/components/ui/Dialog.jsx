import { Modal } from './Modal.jsx'

export function Dialog({ open, title, children, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      {children}
    </Modal>
  )
}
