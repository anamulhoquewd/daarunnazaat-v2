"use client";

import api from "@/axios/intercepter";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

type UserItem = {
  _id: string;
  email: string;
};

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

export function StudentUserCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/users?search=${search}&role=student&profile=null`,
        );
        setUsers(res.data.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search]);

  const selectedUser = users.find((u) => u._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedUser?.email || "Select user..."}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-full">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by email..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No user found"}
            </CommandEmpty>

            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user.email}
                  onSelect={() => {
                    onChange(user._id); // 🔥 form value
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user._id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {user.email}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
