import { AccessApi, AccessPolicy, Community, MemberProfile, MemberRow, Membership, Resource, Role, Session } from './types'

const BASE = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:4000'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    statusText: string,
    serverMessage?: string
  ) {
    super(serverMessage ? `${serverMessage} (${status})` : `Request failed (${status} ${statusText})`)
    this.name = 'ApiError'
  }
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  })
  if (!res.ok) {
    let serverMessage: string | undefined
    try {
      const body = await res.json()
      const raw = body?.message ?? body?.error
      if (typeof raw === 'string' && raw.length <= 120 && !raw.includes('<')) {
        serverMessage = raw
      }
    } catch {}
    throw new ApiError(res.status, res.statusText, serverMessage)
  }
  return res.json() as Promise<T>
}

export class LiveAccessApi implements AccessApi {
  constructor(private readonly address?: string) {}

  async getSession(): Promise<Session> {
    return getJson<Session>(`/access-api/session?address=${this.address ?? ''}`)
  }
  async getCommunity(): Promise<Community> {
    return getJson<Community>('/access-api/community')
  }
  async getMembership(address: string): Promise<Membership | null> {
    return getJson<Membership | null>(`/access-api/members/${address}/membership`)
  }
  async getProfile(address: string): Promise<MemberProfile | null> {
    return getJson<MemberProfile | null>(`/access-api/members/${address}/profile`)
  }
  async listMembers(): Promise<MemberRow[]> {
    return getJson<MemberRow[]>('/access-api/members')
  }
  async listResources(): Promise<Resource[]> {
    return getJson<Resource[]>('/access-api/resources')
  }
  async listPolicies(): Promise<AccessPolicy[]> {
    return getJson<AccessPolicy[]>('/access-api/policies')
  }
  async assignRole(address: string, role: Role): Promise<void> {
    await getJson<void>(`/access-api/members/${address}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role })
    })
  }
  async updatePolicy(policy: AccessPolicy): Promise<void> {
    await getJson<void>('/access-api/policies', {
      method: 'POST',
      body: JSON.stringify(policy)
    })
  }
}
