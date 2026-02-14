"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Save, Plus, Wand2, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/hooks/useFirestore";
import { useToast } from "@/components/ui/use-toast";

export default function TemplateBuilderPage() {
  const router = useRouter();
  const { saveTemplate, user, stats } = useFirestore();
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("New Template");
  const [documentType, setDocumentType] = useState("Invoice");
  const [fields, setFields] = useState([
    { name: "Invoice Number", type: "Text", required: true },
    { name: "Date", type: "Date", required: true },
    { name: "Total Amount", type: "Currency", required: true },
  ]);

  const handleSave = async (isDraft: boolean) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    if (!isDraft && (!stats || stats.creditsRemaining <= 0)) {
       toast({ title: "Insufficient Credits", description: "Cannot save active templates with 0 credits.", variant: "destructive" });
       return;
    }

    try {
      await saveTemplate({
        name: templateName,
        documentType,
        extractionFields: fields.map(f => f.name),
      }, isDraft);

      toast({
        title: isDraft ? "Draft Saved" : "Template Saved",
        description: `Successfully saved ${templateName}`,
      });

      if (!isDraft) {
        router.push("/dashboard/templates");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    }
  };

  const addField = () => {
    setFields([...fields, { name: "New Field", type: "Text", required: false }]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/templates">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Invoice Template</h1>
            <p className="text-muted-foreground text-sm">Define rules for document extraction.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(true)}>Save Draft</Button>
          <Button 
            onClick={() => handleSave(false)}
            disabled={!stats || stats.creditsRemaining <= 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 h-full min-h-0">
        {/* Left Panel - Document Preview */}
        <div className="col-span-12 lg:col-span-7 bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="text-center p-8">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Upload Sample Document</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
              Upload a sample PDF to visually map fields to the extraction rules.
            </p>
            <Button className="mt-6" variant="secondary">Select File</Button>
          </div>
        </div>

        {/* Right Panel - Rules Configuration */}
        <div className="col-span-12 lg:col-span-5 flex flex-col h-full overflow-hidden">
          <Card className="flex-1 flex flex-col border-border/50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle>Extraction Rules</CardTitle>
              <CardDescription>Configure fields to extract.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2">
              <Tabs defaultValue="fields" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fields" className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Wand2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-primary">AI Auto-Detect</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a document to let AI suggest fields automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:border-primary/50 transition-colors group">
                        <div className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-xs font-mono text-muted-foreground">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <Input 
                            value={field.name} 
                            className="h-8 text-sm font-medium border-transparent bg-transparent focus-visible:bg-secondary focus-visible:border-input px-0"
                            onChange={(e) => {
                              const newFields = [...fields];
                              newFields[i].name = e.target.value;
                              setFields(newFields);
                            }}
                          />
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-4 px-1">{field.type}</Badge>
                            {field.required && <Badge variant="secondary" className="text-[10px] h-4 px-1">Required</Badge>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full border-dashed" onClick={addField}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Custom Field
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Template Name</label>
                      <Input 
                        placeholder="e.g. Standard Invoice" 
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
