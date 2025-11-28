import { ChevronDown, CreditCard, LogOut, User } from "lucide-react";
import { DropdownMenu } from "radix-ui";

const UserDropdown = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 ring-slate-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-orange-500/20">
            A
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[220px] bg-slate-800 rounded-lg p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] border border-slate-700 will-change-[transform,opacity] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-50" 
          sideOffset={5}
        >
          <div className="px-2 py-2 border-b border-slate-700 mb-1">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-slate-400">admin@suricata-dash.local</p>
          </div>
          
          <DropdownMenu.Item className="group text-[13px] leading-none text-slate-300 rounded-[3px] flex items-center h-[35px] px-[5px] relative pl-[25px] select-none outline-none data-[highlighted]:bg-slate-700 data-[highlighted]:text-white cursor-pointer">
            <div className="absolute left-0 w-[25px] inline-flex items-center justify-center">
              <User size={14} />
            </div>
            My Profile
          </DropdownMenu.Item>
          
          <DropdownMenu.Item className="group text-[13px] leading-none text-slate-300 rounded-[3px] flex items-center h-[35px] px-[5px] relative pl-[25px] select-none outline-none data-[highlighted]:bg-slate-700 data-[highlighted]:text-white cursor-pointer">
            <div className="absolute left-0 w-[25px] inline-flex items-center justify-center">
              <CreditCard size={14} />
            </div>
            Billing
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-[1px] bg-slate-700 m-[5px]" />

          <DropdownMenu.Item className="group text-[13px] leading-none text-red-400 rounded-[3px] flex items-center h-[35px] px-[5px] relative pl-[25px] select-none outline-none data-[highlighted]:bg-red-900/20 data-[highlighted]:text-red-300 cursor-pointer">
            <div className="absolute left-0 w-[25px] inline-flex items-center justify-center">
              <LogOut size={14} />
            </div>
            Sign out
          </DropdownMenu.Item>
          
          <DropdownMenu.Arrow className="fill-slate-700" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default UserDropdown;