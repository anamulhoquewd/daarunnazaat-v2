// stepper.ts
import { step1Z, step2Z, step3Z, step4Z, step5Z, step6Z } from "./validation";

export const stepSchemas = [step1Z, step2Z, step3Z, step4Z, step5Z, step6Z];

export const TOTAL_STEPS = stepSchemas.length;
