import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackModal } from '../../app/components/FeedbackModal'

const noop = () => {}

describe('FeedbackModal', () => {
  // ── Visibility ────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <FeedbackModal isOpen={false} onClose={noop} onSubmit={noop} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the modal when isOpen is true', () => {
    render(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />)
    expect(screen.getByText('Share feedback')).toBeInTheDocument()
  })

  it('renders all six feedback reason chips', () => {
    render(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />)
    const expectedOptions = [
      'Incorrect or incomplete',
      'Not what I asked for',
      'Slow or buggy',
      'Style or tone',
      'Safety or legal concern',
      'Other',
    ]
    for (const opt of expectedOptions) {
      expect(screen.getByText(opt)).toBeInTheDocument()
    }
  })

  // ── Close interactions ────────────────────────────────────────────────────

  it('calls onClose when the X button is clicked', async () => {
    const onClose = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={onClose} onSubmit={noop} />)
    await userEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when clicking the overlay backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <FeedbackModal isOpen={true} onClose={onClose} onSubmit={noop} />
    )
    // The outer fixed overlay div is the direct container child
    fireEvent.click(container.firstChild as Element)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when ESC key is pressed', () => {
    const onClose = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={onClose} onSubmit={noop} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does NOT call onClose for non-ESC keys', () => {
    const onClose = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={onClose} onSubmit={noop} />)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  // ── Submit button state ───────────────────────────────────────────────────

  it('submit button is disabled when no reason is selected', () => {
    render(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('submit button is enabled after selecting a non-Other reason', async () => {
    render(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />)
    await userEvent.click(screen.getByText('Style or tone'))
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
  })

  it('submit button stays disabled when Other is selected but details are empty', async () => {
    render(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />)
    await userEvent.click(screen.getByText('Other'))
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('submit button is enabled when Other is selected and details are filled', async () => {
    render(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />)
    await userEvent.click(screen.getByText('Other'))
    await userEvent.type(screen.getByPlaceholderText('Share details (optional)'), 'my detail')
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
  })

  // ── Submit callback ───────────────────────────────────────────────────────

  it('calls onSubmit with the selected reason and empty details', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByText('Style or tone'))
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledWith({ reason: 'Style or tone', details: '' })
  })

  it('calls onSubmit with reason and typed details', async () => {
    const onSubmit = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByText('Other'))
    await userEvent.type(screen.getByPlaceholderText('Share details (optional)'), 'bug found')
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledWith({ reason: 'Other', details: 'bug found' })
  })

  it('calls onClose after submitting', async () => {
    const onClose = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={onClose} onSubmit={noop} />)
    await userEvent.click(screen.getByText('Style or tone'))
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  // ── State reset ───────────────────────────────────────────────────────────

  it('resets selected reason when modal closes and reopens', async () => {
    const { rerender } = render(
      <FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />
    )
    await userEvent.click(screen.getByText('Style or tone'))
    rerender(<FeedbackModal isOpen={false} onClose={noop} onSubmit={noop} />)
    rerender(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  // ── onLearnMore ───────────────────────────────────────────────────────────

  it('calls onLearnMore when the learn more link is clicked', async () => {
    const onLearnMore = vi.fn()
    render(<FeedbackModal isOpen={true} onClose={noop} onSubmit={noop} onLearnMore={onLearnMore} />)
    await userEvent.click(screen.getByText('Learn more'))
    expect(onLearnMore).toHaveBeenCalledOnce()
  })
})
