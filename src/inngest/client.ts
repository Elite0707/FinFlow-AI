import { Inngest } from "inngest";

// Define the event payload types for type safety
export type InngestEvents = {
  "finflow/file.process": {
    data: {
      fileName: string;
      fileUrl: string;
      templateFields: string[];
      batchJobId: string;
      userId: string;
    };
  };
};

// Create the Inngest client — used to send events and define functions
export const inngest = new Inngest({
  id: "finflow-app",
  schemas: new Map() as any, // TypeScript event inference
});
