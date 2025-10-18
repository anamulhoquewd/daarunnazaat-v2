"use client";

import { Search, Plus, MoreHorizontal, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Paginations from "@/components/paginations";
import { DeleteAlert } from "@/components/delete-alert";
import useClasses from "@/hooks/classes/use-classes";
import { IClass } from "@/interfaces";
import AddModal from "@/components/classes/add-modal";

export default function UsersPage() {
  const {
    pagination,
    setPagination,
    search,
    setSearch,
    classes,
    selectedItem,
    setSelectedItem,
    handleDelete,
    form,
    handleSubmit,
    isAddOpen,
    setIsAddOpen,
    isLoading,
    setIsDeleteOpen,
    isDeleteOpen,
    isEditing,
    setIsEditing,
    handleUpdate,
  } = useClasses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage classes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add new
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>
            You have {pagination.total} classes in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Opening Date</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No products found. Try adjusting your search or filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map((c: IClass) => (
                    <TableRow key={c._id}>
                      <TableCell>{c?.name}</TableCell>
                      <TableCell>{c?.teacher}</TableCell>
                      <TableCell>{c?.description}</TableCell>
                      <TableCell>
                        {c?.opening_date
                          ? format(c?.opening_date, "dd MM, yyyy")
                          : ""}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                              <span className="sr-only">More Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setIsEditing(true);
                                setSelectedItem(c);
                              }}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setIsDeleteOpen(true);
                                setSelectedItem(c);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {classes.length !== 0 && (
          <CardFooter className="flex items-center justify-end">
            <Paginations
              pagination={pagination}
              setPagination={setPagination}
            />
          </CardFooter>
        )}

        {selectedItem && (
          <DeleteAlert
            onConfirm={() => handleDelete(selectedItem._id)}
            open={isDeleteOpen}
            changeOpen={setIsDeleteOpen}
          />
        )}
      </Card>

      <AddModal
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        form={form}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      {selectedItem && (
        <AddModal
          isOpen={isEditing}
          setIsOpen={setIsEditing}
          form={form}
          isLoading={isLoading}
          onSubmit={handleUpdate}
          values={selectedItem}
          setValues={setSelectedItem}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}
