import {
  Dialog,
  DialogClose,
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

function PaymentReceiver({ expense }: { expense: IExpense }) {
  const { paidTo } = expense;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show receiver</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Receiver Details</DialogTitle>
          <DialogDescription>
            This section shows the person who received the payment from the
            office, including their name and contact number.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!paidTo ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No receiver for this record
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell className="max-w-[200px] whitespace-normal break-words">
                    {paidTo?.name || "_"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {paidTo?.phone || "_"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentReceiver;
