import { IStudent } from "@/validations";
import { useFormContext } from "react-hook-form";

export default function PreviewStep() {
  const { getValues } = useFormContext<IStudent>();
  const data = getValues();

  return (
    <pre className="bg-muted p-4 rounded text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
