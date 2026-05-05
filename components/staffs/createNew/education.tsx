import { Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";

function Qualification() {
  const { control, formState } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications",
  });

  const addQualification = () => {
    append({
      degree: "",
      institution: "",
      yearOfCompletion: new Date().getFullYear(),
      grade: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Qualifications</CardTitle>
        <CardDescription>Educational background (optional)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No qualifications added yet. Click the button below to add one.
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-4 bg-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Qualification {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={formState.isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`qualifications.${index}.degree`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Bachelor's in Islamic Studies"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`qualifications.${index}.institution`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Al-Azhar University"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`qualifications.${index}.yearOfCompletion`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Completion *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2020"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`qualifications.${index}.grade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade / CGPA</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 3.5/4.0 or A"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addQualification}
          className="w-full"
          disabled={formState.isSubmitting}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Qualification
        </Button>
      </CardContent>
    </Card>
  );
}

export default Qualification;
