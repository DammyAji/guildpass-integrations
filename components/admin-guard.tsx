"use client"
import { ReactNode } from "react"
import { useAccount } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import { getApi } from "@/lib/api"
import { AccessDenied } from "./gated"
import { LoadingState, ErrorState, safeErrorMessage } from "./ui/api-states"

export function AdminGuard({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  const { data: session, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['session', address],
    queryFn: () => getApi(address).getSession(),
    enabled: !!address,
    retry: 1
  })

  if (!address) return <AccessDenied reason="Admin area requires wallet connection." />
  if (isLoading) return <LoadingState message="Checking admin access…" />
  if (isError) {
    return (
      <ErrorState
        title="Could not verify admin access"
        message={safeErrorMessage(error)}
        onRetry={() => refetch()}
      />
    )
  }
  if (!session?.roles?.includes('admin')) return <AccessDenied reason="Admin privileges are required." />
  return <>{children}</>
}
