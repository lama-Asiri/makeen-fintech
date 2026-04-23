import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast } from '../../app/components/Toast'

describe('Toast', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the message text', () => {
    render(<Toast message="File uploaded!" onClose={() => {}} />)
    expect(screen.getByText('File uploaded!')).toBeInTheDocument()
  })

  it('renders nothing when message is empty string', () => {
    const { container } = render(<Toast message="" onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the close button', () => {
    render(<Toast message="Test" onClose={() => {}} />)
    expect(screen.getByLabelText('Close notification')).toBeInTheDocument()
  })

  // ── Close button ──────────────────────────────────────────────────────────

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<Toast message="Test" onClose={onClose} />)
    await userEvent.click(screen.getByLabelText('Close notification'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  // ── Auto-hide timer ───────────────────────────────────────────────────────

  it('calls onClose after the default 4000ms', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Test" onClose={onClose} />)
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(4001)
    })
    expect(onClose).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('calls onClose after a custom autoHideDuration', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Test" onClose={onClose} autoHideDuration={1000} />)
    await act(async () => {
      vi.advanceTimersByTime(999)
    })
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(2)
    })
    expect(onClose).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('does not call onClose before the timer fires', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Test" onClose={onClose} autoHideDuration={2000} />)
    await act(async () => {
      vi.advanceTimersByTime(1999)
    })
    expect(onClose).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('clears the timer when message becomes empty', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const { rerender } = render(<Toast message="Test" onClose={onClose} autoHideDuration={2000} />)
    rerender(<Toast message="" onClose={onClose} autoHideDuration={2000} />)
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(onClose).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
