"use client"
import { useAccount } from "wagmi"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApi, type MemberRow, type Role } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { AdminGuard } from "@/components/admin-guard"
import { LoadingState, ErrorState, EmptyState, safeErrorMessage } from "@/components/ui/api-states"

export default function MembersPage() {
  const { address } = useAccount()
  const qc = useQueryClient()
  const { data: members, isLoading, isError, error, refetch } = useQuery<MemberRow[]>({
    queryKey: ['members'],
    queryFn: () => getApi(address).listMembers(),
    retry: 1
  })
  const [addr, setAddr] = useState('')
  const [role, setRole] = useState<Role>('member')
  const {
    mutate,
    isPending,
    isError: mutateError,
    error: mutateErrorValue,
    reset: resetMutation
  } = useMutation({
    mutationFn: () => getApi(address).assignRole(addr, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      setAddr('')
      resetMutation()
    }
  })

  return (
    <AdminGuard>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Members</h1>
        <Card>
          <CardHeader><CardTitle>Assign Role</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Input placeholder="0x…" value={addr} onChange={e => setAddr(e.target.value)} />
              <select
                className="border rounded-md h-9 px-2 text-sm"
                value={role}
                onChange={e => setRole(e.target.value as Role)}
              >
                <option value="member">member</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
              </select>
              <Button onClick={() => mutate()} disabled={!addr || isPending}>
                {isPending ? 'Assigning…' : 'Assign'}
              </Button>
            </div>
            {mutateError && (
              <ErrorState
                title="Failed to assign role"
                message={safeErrorMessage(mutateErrorValue)}
                onRetry={() => mutate()}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Member List</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState message="Loading members…" />
            ) : isError ? (
              <ErrorState
                title="Failed to load members"
                message={safeErrorMessage(error)}
                onRetry={() => refetch()}
              />
            ) : !members?.length ? (
              <EmptyState message="No members yet." />
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.address} className="flex items-center justify-between border rounded-md p-2">
                    <div className="text-sm">{m.address}</div>
                    <div className="text-xs text-muted-foreground">
                      Tier: {m.tier} • Roles: {m.roles.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
