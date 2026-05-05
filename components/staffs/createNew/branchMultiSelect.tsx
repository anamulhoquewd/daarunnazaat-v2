import { Branch } from "@/validations";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown , Check} from "lucide-react";
import { Button } from "@/components/ui/button";

const branches = [
  { label: "All", value: "all" },
  ...Object.values(Branch).map((branch) => ({
    label: branch
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" "),
    value: branch,
  })),
];

function BranchMultiSelect({value, onChange}: {value: string[], onChange: (value: string[]) => void}) {

    const toggleBranch = (branch: string) => {
       const normalized = value.filter((r) => r && r.trim().length > 0);

    if (branch === "all") {
      if (normalized.includes("all")) {
        onChange([]);
      } else {
        onChange(["all"]);
      }
      return;
    }

    if (normalized.includes(branch)) {
      // toggle the branch off
      const next = normalized.filter((r) => r !== branch);
      onChange(next);
      return;
    }

    // select any non-all branch
    if (normalized.includes("all")) {
      onChange([branch]);
      return;
    }

    onChange([...normalized, branch]);
    };



  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between capitalize">
          {value.length > 0 ? value.join(", ") : "Select branches"}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandGroup>
            {branches.map((branch) => (
              <CommandItem
                key={branch.value}
                onSelect={() => toggleBranch(branch.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value.includes(branch.value) ? "opacity-100" : "opacity-0"
                  }`}
                />
                {branch.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default BranchMultiSelect
