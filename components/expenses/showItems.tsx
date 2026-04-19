import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IExpense } from "@/validations";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

function ShowItems({ expense }: { expense: IExpense }) {
  const { items } = expense;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show items</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Expense Breakdown
          </DialogTitle>
          <DialogDescription>
            Detailed list of items with quantity and pricing.
          </DialogDescription>
        </DialogHeader>

        {/* Table */}
        <div className="-mx-4 px-4">
          <ScrollArea className="w-full max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-center">Unit Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No items added
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow
                      key={item._id}
                      className="hover:bg-muted/50 transition"
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>

                      <TableCell className="text-muted-foreground">
                        {item.unit}
                      </TableCell>

                      <TableCell className="text-center">
                        {item.unitPrice}
                      </TableCell>

                      <TableCell className="text-center font-medium">
                        {item.quantity}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {item.total}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Footer Summary */}
        <DialogFooter className="mt-4">
          <div className="w-full border rounded-xl p-4 bg-green-50 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Items:{" "}
              <span className="font-semibold text-foreground">
                {items.length}
              </span>
            </div>
            <div>
              Quantity: <span className="font-semibold">{totalQuantity}</span>
            </div>
            <div>
              Total Amount:{" "}
              <span className="text-base font-bold">{expense.amount}</span>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShowItems;
