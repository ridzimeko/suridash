import {
  LogOut,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/services/auth";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}


export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex items-center gap-2 rounded-full focus:outline-none">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuLabel className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span className="text-sm">{user.name}</span>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className="text-red-600 focus:text-red-600"
        onClick={async () => {
          await logout();
          window.location.href = '/';
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}
