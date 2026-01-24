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
  className: string;
};

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

export function ClassCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [classes, setClasses] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/classes?search=${search}`);
        setClasses(res.data.data);
      } catch (error) {
        console.error("Failed to fetch guardians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [search]);

  const selectedUser = classes.find((u) => u._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedUser?.className || "Select user..."}
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
              {classes.map((c) => (
                <CommandItem
                  key={c._id}
                  value={c._id} // value যেকোনো string হতে পারে
                  onSelect={() => {
                    onChange(c._id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === c._id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {c?.className}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
