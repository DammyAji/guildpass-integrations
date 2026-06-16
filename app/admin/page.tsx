"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/admin-guard"

export default function AdminHome() {
  return (
    <AdminGuard>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview and quick links.</p>
        <div className="flex items-center gap-2">
          <Button asChild><Link href="/admin/members">Members</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/policies">Access Policies</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/settings">Settings</Link></Button>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Community overview placeholder with metrics.</div>
        </div>
      </div>
    </AdminGuard>
  )
}
