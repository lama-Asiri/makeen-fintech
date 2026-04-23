import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../../app/components/LoginForm'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      setSession: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function ok(body: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)
}
function fail(body: unknown) {
  return Promise.resolve({ ok: false, json: () => Promise.resolve(body) } as Response)
}

const defaultProps = {
  onSuccess: vi.fn(),
  onForgotPassword: vi.fn(),
  onSignUp: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('LoginForm', () => {
  // ── Rendering ───────────────────────────────────────────────────────────────

  it('renders the welcome heading', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders Sign in, Google and Apple buttons', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument()
  })

  it('renders Forgot password and Create an account buttons', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create an account/i })).toBeInTheDocument()
  })

  it('renders the password visibility toggle', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByLabelText('Show password')).toBeInTheDocument()
  })

  // ── Navigation callbacks ─────────────────────────────────────────────────────

  it('calls onForgotPassword when Forgot password is clicked', async () => {
    const onForgotPassword = vi.fn()
    render(<LoginForm {...defaultProps} onForgotPassword={onForgotPassword} />)
    await userEvent.click(screen.getByRole('button', { name: /forgot password/i }))
    expect(onForgotPassword).toHaveBeenCalledOnce()
  })

  it('calls onSignUp when Create an account is clicked', async () => {
    const onSignUp = vi.fn()
    render(<LoginForm {...defaultProps} onSignUp={onSignUp} />)
    await userEvent.click(screen.getByRole('button', { name: /create an account/i }))
    expect(onSignUp).toHaveBeenCalledOnce()
  })

  // ── Password toggle ──────────────────────────────────────────────────────────

  it('toggles password visibility when the eye icon is clicked', async () => {
    render(<LoginForm {...defaultProps} />)
    const input = screen.getByPlaceholderText('••••••••') as HTMLInputElement
    expect(input.type).toBe('password')
    await userEvent.click(screen.getByLabelText('Show password'))
    expect(input.type).toBe('text')
    await userEvent.click(screen.getByLabelText('Hide password'))
    expect(input.type).toBe('password')
  })

  // ── Login success ────────────────────────────────────────────────────────────

  it('calls onSuccess and setSession after a successful login', async () => {
    const { supabase } = await import('../../lib/supabase')
    mockFetch.mockReturnValueOnce(ok({ access_token: 'at', refresh_token: 'rt' }))
    const onSuccess = vi.fn()
    render(<LoginForm {...defaultProps} onSuccess={onSuccess} />)
    await userEvent.type(screen.getByPlaceholderText('name@company.com'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    expect(supabase.auth.setSession).toHaveBeenCalledWith({ access_token: 'at', refresh_token: 'rt' })
  })

  // ── Login failure ────────────────────────────────────────────────────────────

  it('shows the error detail from the API on failed login', async () => {
    mockFetch.mockReturnValueOnce(fail({ detail: 'Invalid email or password.' }))
    render(<LoginForm {...defaultProps} />)
    await userEvent.type(screen.getByPlaceholderText('name@company.com'), 'bad@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
    })
    expect(defaultProps.onSuccess).not.toHaveBeenCalled()
  })

  it('clears the previous error message when a new submission starts', async () => {
    const { supabase } = await import('../../lib/supabase')
    mockFetch
      .mockReturnValueOnce(fail({ detail: 'Invalid email or password.' }))
      .mockReturnValueOnce(ok({ access_token: 'at', refresh_token: 'rt' }))
    const onSuccess = vi.fn()
    render(<LoginForm {...defaultProps} onSuccess={onSuccess} />)
    await userEvent.type(screen.getByPlaceholderText('name@company.com'), 'u@e.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password1')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => screen.getByText('Invalid email or password.'))
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument()
  })

  // ── Apple coming soon toast ──────────────────────────────────────────────────

  it('shows Coming soon toast when Apple button is clicked', async () => {
    render(<LoginForm {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /apple/i }))
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })

  it('hides Coming soon toast after closing it', async () => {
    render(<LoginForm {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /apple/i }))
    await userEvent.click(screen.getByLabelText('Close notification'))
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument()
  })
})
