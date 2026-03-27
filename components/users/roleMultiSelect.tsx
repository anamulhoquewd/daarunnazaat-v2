import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const roles = [
  { label: "All", value: "all" },
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Guardian", value: "guardian" },
];

export function RoleMultiSelect({
  value,
  onChange,
}: {
  onChange: (value: string[]) => void;
  value: string[];
}) {
  const toggleRole = (role: string) => {
    const normalized = value.filter((r) => r && r.trim().length > 0);

    if (role === "all") {
      if (normalized.includes("all")) {
        onChange([]);
      } else {
        onChange(["all"]);
      }
      return;
    }

    if (normalized.includes(role)) {
      // toggle the role off
      const next = normalized.filter((r) => r !== role);
      onChange(next);
      return;
    }

    // select any non-all role
    if (normalized.includes("all")) {
      onChange([role]);
      return;
    }

    onChange([...normalized, role]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between capitalize">
          {value.length > 0 ? value.join(", ") : "Select roles"}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandGroup>
            {roles.map((role) => (
              <CommandItem
                key={role.value}
                onSelect={() => toggleRole(role.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value.includes(role.value) ? "opacity-100" : "opacity-0"
                  }`}
                />
                {role.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
