"use client";

import api from "@/axios/intercepter";
import { DateField } from "@/components/common/dateCalendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, handleAxiosError } from "@/lib/utils";
import {
  Branch,
  ExpenseCategory,
  expenseZ,
  IExpense,
  PaymentMethod,
} from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverTrigger,PopoverContent } from "../ui/popover";

const createEmptyItem = () => ({
  name: "",
  quantity: 1,
  unit: "",
  unitPrice: 0,
  total: 0,
});

function ExpenseCenter() {
  const router = useRouter();

  const form = useForm<z.infer<typeof expenseZ>>({
    resolver: zodResolver(expenseZ) as any,
    defaultValues: {
      category: undefined,
      description: "",
      amount: 0,
      expenseDate: new Date(),
      paymentMethod: PaymentMethod.CASH,
      branch: [],
      paidTo: { name: "", phone: "" },
      items: [createEmptyItem()],
      remarks: "",
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  // ── Derived totals ─────────────────────────────────────────────────────────
  // Computed directly from watched values on every render.
  // No useEffect / setValue needed — always in sync with user input.
  const watchedItems = form.watch("items");
  const watchedBranches = form.watch("branch");

  const itemTotals = (watchedItems ?? []).map(
    // @ts-ignore
    (item) => (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0),
  );
  // @ts-ignore
  const totalAmount = itemTotals.reduce((sum, t) => sum + t, 0);

  // ── Branch toggle ──────────────────────────────────────────────────────────
  const toggleBranch = (branchValue: Branch, checked: boolean) => {
    const current = form.getValues("branch") ?? [];
    const updated = checked
      ? [...current, branchValue]
      : // @ts-ignore
        current.filter((b) => b !== branchValue);
    form.setValue("branch", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const clearForm = () => {
    form.reset({
      category: undefined,
      description: "",
      amount: 0,
      expenseDate: new Date(),
      paymentMethod: PaymentMethod.CASH,
      branch: [],
      paidTo: { name: "", phone: "" },
      items: [createEmptyItem()],
      remarks: "",
    });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (
    data: z.infer<typeof expenseZ>,
  ): Promise<void> => {
    try {
      // Inject computed totals so the Zod schema is satisfied.
      // The backend will recalculate and override these server-side.
      const itemsWithTotal = (data.items ?? []).map((item: any): any => ({
        ...item,
        total: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      }));

      const payload: IExpense = {
        ...data,
        items: itemsWithTotal,
        amount: itemsWithTotal.reduce(
          (sum: number, item: any): number => sum + item.total,
          0,
        ),
        remarks: data.remarks || undefined,
      };

      const response = await api.post("/expenses/register", payload);

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message || "Failed to create expense",
        );
      }

      toast.success(response.data.message || "Expense created successfully");

      const expenseId = response.data.data?._id;
      clearForm();

      router.push(
        expenseId ? `/dashboard/expenses/${expenseId}` : "/dashboard/expenses",
      );
    } catch (error: any) {
      handleAxiosError(error);
      if (error.response?.data?.fields?.length) {
        error.response.data.fields.forEach((fieldError: any) => {
          form.setError(fieldError.name as any, {
            message: fieldError.message,
          });
        });
      }
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="w-full flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Expense Center
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Create a new expense record with item breakdown and payment details.
        </p>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="space-y-6"
          >
            {/* ── Expense Details ─────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>
                  Fill in the basic information for this expense.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select expense category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ExpenseCategory).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expense Date */}
                <DateField name="expenseDate" label="Expense Date" />

                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PaymentMethod).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Amount — derived, not a controlled form field */}
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <Input value={totalAmount} readOnly type="number" />
                </FormItem>

                {/* Branch — multi-select */}
                <FormField
                  control={form.control}
                  name="branch"
                  render={() => (
                    <FormItem>
                      <FormLabel>Branch *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal",
                                !watchedBranches?.length &&
                                  "text-muted-foreground",
                              )}
                            >
                              <span className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
                                {watchedBranches?.length
                                  ? watchedBranches.map((b) => (
                                      <Badge
                                        key={b}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {b}
                                      </Badge>
                                    ))
                                  : "Select branches"}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandList>
                              <CommandEmpty>No branch found.</CommandEmpty>
                              <CommandGroup>
                                {Object.values(Branch).map((branchValue) => {
                                  const isSelected =
                                    watchedBranches?.includes(branchValue);
                                  return (
                                    <CommandItem
                                      key={branchValue}
                                      value={branchValue}
                                      onSelect={() =>
                                        toggleBranch(branchValue, !isSelected)
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          isSelected
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {branchValue}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Write a short summary of this expense"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ── Receiver Information ─────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Receiver Information</CardTitle>
                <CardDescription>
                  Add the person who received this payment.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="paidTo.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiver Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Md. Anam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paidTo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiver Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="01XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ── Expense Items ─────────────────────────────────────────────── */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Expense Items</CardTitle>
                  <CardDescription>
                    Add one or more items to calculate the total amount.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendItem(createEmptyItem())}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemFields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid gap-4 rounded-lg border p-4 md:grid-cols-12"
                  >
                    {/* Item Name */}
                    <div className="md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Paper" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                value={field.value ?? 1}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value || 0))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Unit */}
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit *</FormLabel>
                            <FormControl>
                              <Input placeholder="pcs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                value={field.value ?? 0}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value || 0))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Total — derived from itemTotals, not a controlled field */}
                    <div className="md:col-span-2">
                      <FormItem>
                        <FormLabel>Total</FormLabel>
                        <Input
                          type="number"
                          value={itemTotals[index] ?? 0}
                          readOnly
                        />
                      </FormItem>
                    </div>

                    {/* Remove */}
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="w-full"
                        disabled={itemFields.length === 1}
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ── Notes ────────────────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Any optional remarks.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Optional internal notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={clearForm}>
                Clear
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {form.formState.isSubmitting
                  ? "Creating Expense..."
                  : "Create Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </main>
  );
}

export default ExpenseCenter;
