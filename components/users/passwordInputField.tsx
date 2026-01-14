import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

const PasswordInputField = ({
  form,
  showPassword,
  setShowPassword,
  name,
  placeholder,
  label,
}: {
  form: any;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  placeholder: string;
  label: string;
}) => {
  return (
    <div className="relative">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between items-center cursor-pointer">
              {label}
            </FormLabel>
            <div className="relative flex items-center">
              <FormControl className="w-full">
                <Input
                  placeholder={placeholder}
                  type={showPassword ? "text" : "password"}
                  {...field}
                  className="pr-10" // Extra right padding for icon space
                />
              </FormControl>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 text-muted-foreground cursor-pointer"
                onMouseDown={() => setShowPassword(!showPassword)}
                onMouseUp={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export { PasswordInputField };
