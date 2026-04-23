import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addChatAPI,
  deleteChatAPI,
  deleteAllChatsAPI,
  viewHistoryAPI,
  saveMessageAPI,
  renameChatAPI,
  uploadFileAPI,
} from '../../lib/chatApi'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

function ok(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

function err(text: string) {
  return Promise.resolve({
    ok: false,
    status: 400,
    text: () => Promise.resolve(text),
  } as Response)
}

// ── addChatAPI ────────────────────────────────────────────────────────────────

describe('addChatAPI', () => {
  it('returns the CHAT_ID from the response', async () => {
    mockFetch.mockReturnValueOnce(ok({ CHAT_ID: 42 }))
    const id = await addChatAPI('my-token', 'Chat 1')
    expect(id).toBe(42)
  })

  it('sends the title in the request body', async () => {
    mockFetch.mockReturnValueOnce(ok({ CHAT_ID: 1 }))
    await addChatAPI('tok', 'New Chat')
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.Title).toBe('New Chat')
  })

  it('includes the Authorization header', async () => {
    mockFetch.mockReturnValueOnce(ok({ CHAT_ID: 1 }))
    await addChatAPI('my-token', 'x')
    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['Authorization']).toBe('Bearer my-token')
  })

  it('throws when the response is not ok', async () => {
    mockFetch.mockReturnValueOnce(err('You cannot have more than 3 chats'))
    await expect(addChatAPI('tok', 'Chat 4')).rejects.toThrow('You cannot have more than 3 chats')
  })
})

// ── deleteChatAPI ─────────────────────────────────────────────────────────────

describe('deleteChatAPI', () => {
  it('calls DELETE with the correct chat_id query param', async () => {
    mockFetch.mockReturnValueOnce(ok({}))
    await deleteChatAPI('tok', 7)
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/auth/deleteChat?chat_id=7')
    expect(opts.method).toBe('DELETE')
  })

  it('throws when server returns an error', async () => {
    mockFetch.mockReturnValueOnce(err('Chat not found'))
    await expect(deleteChatAPI('tok', 99)).rejects.toThrow('Chat not found')
  })
})

// ── deleteAllChatsAPI ─────────────────────────────────────────────────────────

describe('deleteAllChatsAPI', () => {
  it('calls DELETE on deleteAllChats endpoint', async () => {
    mockFetch.mockReturnValueOnce(ok({}))
    await deleteAllChatsAPI('tok')
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/auth/deleteAllChats')
    expect(opts.method).toBe('DELETE')
  })
})

// ── viewHistoryAPI ────────────────────────────────────────────────────────────

describe('viewHistoryAPI', () => {
  it('returns the chats array from the response', async () => {
    const chats = [{ CHAT_ID: 1, Title: 'Chat 1', USER_ID: 'u', Created_at: '', File: null }]
    mockFetch.mockReturnValueOnce(ok({ chats }))
    const result = await viewHistoryAPI('tok')
    expect(result).toEqual(chats)
  })

  it('throws when server returns an error', async () => {
    mockFetch.mockReturnValueOnce(err('Unauthorized'))
    await expect(viewHistoryAPI('bad')).rejects.toThrow('Unauthorized')
  })
})

// ── saveMessageAPI ────────────────────────────────────────────────────────────

describe('saveMessageAPI', () => {
  it('returns responseId from RESPONSE_ID field', async () => {
    mockFetch.mockReturnValueOnce(ok({ RESPONSE_ID: 99 }))
    const result = await saveMessageAPI('tok', 1, 'question', 'answer')
    expect(result.responseId).toBe(99)
  })

  it('serialises xaiData into the explanation field', async () => {
    mockFetch.mockReturnValueOnce(ok({ RESPONSE_ID: 1 }))
    const xai = { prediction: '1', shap: { age: 0.3 } }
    await saveMessageAPI('tok', 1, 'q', 'a', xai)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.explanation).toBe(JSON.stringify(xai))
  })

  it('sends empty explanation when xaiData is not provided', async () => {
    mockFetch.mockReturnValueOnce(ok({ RESPONSE_ID: 1 }))
    await saveMessageAPI('tok', 1, 'q', 'a')
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.explanation).toBe('')
  })
})

// ── renameChatAPI ─────────────────────────────────────────────────────────────

describe('renameChatAPI', () => {
  it('calls PATCH with the correct body', async () => {
    mockFetch.mockReturnValueOnce(ok({}))
    await renameChatAPI('tok', 3, 'New Name')
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/auth/renameChat')
    expect(opts.method).toBe('PATCH')
    const body = JSON.parse(opts.body)
    expect(body).toEqual({ chat_id: 3, new_title: 'New Name' })
  })

  it('throws when server returns an error', async () => {
    mockFetch.mockReturnValueOnce(err('Not found'))
    await expect(renameChatAPI('tok', 999, 'x')).rejects.toThrow('Not found')
  })
})

// ── uploadFileAPI ─────────────────────────────────────────────────────────────

describe('uploadFileAPI', () => {
  it('returns column names from the response', async () => {
    mockFetch.mockReturnValueOnce(ok({ columns: ['age', 'bmi', 'stroke'] }))
    const file = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' })
    const result = await uploadFileAPI('tok', file, 5)
    expect(result).toEqual(['age', 'bmi', 'stroke'])
  })

  it('calls the upload endpoint with POST', async () => {
    mockFetch.mockReturnValueOnce(ok({ columns: [] }))
    const file = new File(['content'], 'data.csv', { type: 'text/csv' })
    await uploadFileAPI('tok', file, 5)
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/auth/upload')
    expect(opts.method).toBe('POST')
  })

  it('sends a FormData body', async () => {
    mockFetch.mockReturnValueOnce(ok({ columns: [] }))
    const file = new File(['content'], 'data.csv', { type: 'text/csv' })
    await uploadFileAPI('tok', file, 5)
    expect(mockFetch.mock.calls[0][1].body).toBeInstanceOf(FormData)
  })

  it('does NOT set Content-Type header so the browser can add the multipart boundary', async () => {
    mockFetch.mockReturnValueOnce(ok({ columns: [] }))
    const file = new File(['content'], 'data.csv')
    await uploadFileAPI('tok', file, 5)
    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['Content-Type']).toBeUndefined()
  })

  it('throws when the server returns an error', async () => {
    mockFetch.mockReturnValueOnce(err('Only CSV or XLSX allowed'))
    const file = new File(['content'], 'report.txt')
    await expect(uploadFileAPI('tok', file, 5)).rejects.toThrow('Only CSV or XLSX allowed')
  })
})
