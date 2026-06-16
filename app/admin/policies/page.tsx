"use client"
import { useAccount } from "wagmi"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApi, type AccessPolicy } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/admin-guard"
import { LoadingState, ErrorState, EmptyState, safeErrorMessage } from "@/components/ui/api-states"

export default function PoliciesPage() {
  const { address } = useAccount()
  const qc = useQueryClient()
  const { data: policies, isLoading, isError, error, refetch } = useQuery<AccessPolicy[]>({
    queryKey: ['policies'],
    queryFn: () => getApi(address).listPolicies(),
    retry: 1
  })
  const {
    mutate,
    isPending,
    isError: mutateError,
    error: mutateErrorValue,
    reset: resetMutation
  } = useMutation({
    mutationFn: (p: AccessPolicy) => getApi(address).updatePolicy(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies'] })
      resetMutation()
    }
  })

  return (
    <AdminGuard>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Access Policies</h1>
        <Card>
          <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <LoadingState message="Loading policies…" />
            ) : isError ? (
              <ErrorState
                title="Failed to load policies"
                message={safeErrorMessage(error)}
                onRetry={() => refetch()}
              />
            ) : !policies?.length ? (
              <EmptyState message="No resources configured." />
            ) : (
              policies.map(p => (
                <div key={p.resourceId} className="flex items-center gap-2">
                  <div className="w-40 text-sm">{p.resourceId}</div>
                  <select
                    className="border rounded-md h-9 px-2 text-sm"
                    value={p.minTier ?? 'free'}
                    onChange={e => mutate({ ...p, minTier: e.target.value as AccessPolicy['minTier'] })}
                    disabled={isPending}
                  >
                    <option value="free">free</option>
                    <option value="standard">standard</option>
                    <option value="pro">pro</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mutate({ ...p })}
                    disabled={isPending}
                  >
                    {isPending ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              ))
            )}
            {mutateError && (
              <ErrorState
                title="Failed to save policy"
                message={safeErrorMessage(mutateErrorValue)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
