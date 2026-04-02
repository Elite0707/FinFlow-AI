"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Save, Plus, Wand2, ArrowRight, Loader2, Trash2, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/hooks/useFirestore";
import { useToast } from "@/components/ui/use-toast";
import PdfPreview from "@/components/PdfPreview";

function TemplateBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const { saveTemplate, updateTemplate, getTemplate, uploadFile, user, stats } = useFirestore();
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("New Template");
  const [documentType, setDocumentType] = useState("Invoice");
  const [fields, setFields] = useState<Array<{ name: string; type: string; required: boolean }>>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      let _fields = [...fields];
      // remove and save the dragged item
      const draggedItemContent = _fields.splice(dragItem.current, 1)[0];
      // switch the position
      _fields.splice(dragOverItem.current, 0, draggedItemContent);

      // reset refs
      dragItem.current = null;
      dragOverItem.current = null;

      // update state
      setFields(_fields);
    }
  };

  useEffect(() => {
    if (templateId && user) {
      const loadTemplate = async () => {
        try {
          const template = await getTemplate(templateId);
          if (template) {
            setTemplateName(template.name);
            setDocumentType(template.documentType);
            if (template.extractionFields) {
              setFields(template.extractionFields.map((field: string) => ({
                name: field,
                type: "Text",
                required: false
              })));
            }
          }
        } catch (error) {
          console.error("Failed to load template", error);
          toast({
            title: "Error",
            description: "Failed to load template details",
            variant: "destructive"
          });
        }
      };
      loadTemplate();
    }
  }, [templateId, user, getTemplate, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please upload a document first.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/templates/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      if (data.fields) {
        const newFields = Object.keys(data.fields).map(key => ({
          name: key,
          type: "Text",
          required: false
        }));
        setFields(newFields);
        toast({ title: "Analysis Complete", description: "Fields have been auto-detected." });
      }

    } catch (error) {
      console.error(error);
      toast({ title: "Analysis Failed", description: "Could not analyze document.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    if (!isDraft && (!stats || stats.creditsRemaining <= 0)) {
      toast({ title: "Insufficient Credits", description: "Cannot save active templates with 0 credits.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      let fileUrl = "";
      // Upload file if new one selected
      if (selectedFile) {
        const upload = uploadFile(selectedFile);
        if (upload) {
          fileUrl = await upload.promise;
        }
      }

      const templateData = {
        name: templateName,
        documentType,
        extractionFields: fields.map(f => f.name),
        fileUrl: fileUrl || undefined
      };

      if (templateId) {
        await updateTemplate(templateId, { ...templateData, isDraft });
        toast({
          title: "Template Updated",
          description: `Successfully updated ${templateName}`,
        });
      } else {
        await saveTemplate(templateData, isDraft);
        toast({
          title: isDraft ? "Draft Saved" : "Template Saved",
          description: `Successfully saved ${templateName}`,
        });
      }

      if (!isDraft) {
        router.push("/dashboard/templates");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    setFields([...fields, { name: "New Field", type: "Text", required: false }]);
  };

  const removeField = (indexToRemove: number) => {
    setFields(fields.filter((_, index) => index !== indexToRemove));
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
          <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={(!stats || stats.creditsRemaining <= 0) || isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Template
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 h-full min-h-0">
        {/* Left Panel - Document Preview */}
        <div className="col-span-12 lg:col-span-7 bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center relative overflow-hidden">
          {selectedFile ? (
            <div className="text-center p-8 w-full h-full flex flex-col items-center justify-center relative">
              {selectedFile.type === 'application/pdf' ? (
                <div className="w-full h-full overflow-auto bg-gray-100/50 rounded-lg p-4">
                  <PdfPreview file={selectedFile} className="w-full shadow-lg" />
                </div>
              ) : (
                <div className="h-20 w-16 bg-white shadow-sm border rounded-sm flex items-center justify-center mb-4 relative">
                  <div className="absolute top-0 right-0 w-4 h-4 bg-muted-foreground/10" style={{ clipPath: "polygon(0 0, 0% 100%, 100% 0)" }}></div>
                  <span className="text-xs font-bold text-muted-foreground">{selectedFile.name.split('.').pop()?.toUpperCase()}</span>
                </div>
              )}

              <h3 className="text-lg font-semibold truncate max-w-xs">{selectedFile.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex gap-3 mt-6 z-10">
                <Button variant="outline" onClick={clearFile}>Remove File</Button>
                <Button variant="secondary" onClick={triggerFileInput}>Replace File</Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Upload Sample Document</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                Upload a sample PDF to visually map fields to the extraction rules.
              </p>
              <Button className="mt-6" variant="secondary" onClick={triggerFileInput}>Select File</Button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />
        </div>

        {/* Right Panel - Rules Configuration */}
        <div className="col-span-12 lg:col-span-5 flex flex-col h-full overflow-hidden">
          <Card className="flex-1 flex flex-col border-border/50 shadow-none min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle>Extraction Rules</CardTitle>
              <CardDescription>Configure fields to extract.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 min-h-0">
              <Tabs defaultValue="fields" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-4 cursor-pointer hover:bg-primary/10 transition-colors" onClick={analyzeDocument}>
                    <div className="flex items-start gap-3">
                      <Wand2 className={`h-5 w-5 text-primary mt-0.5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                      <div>
                        <h4 className="font-semibold text-sm text-primary">
                          {isAnalyzing ? "Analyzing Document..." : "AI Auto-Detect"}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isAnalyzing ? "Gemini is extracting fields..." : "Upload a document to let AI suggest fields automatically."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:border-primary/50 transition-colors group relative"
                        draggable
                        onDragStart={() => (dragItem.current = i)}
                        onDragEnter={() => (dragOverItem.current = i)}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <div className="cursor-move text-muted-foreground/50 hover:text-foreground transition-colors mr-[-4px]">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="h-6 w-6 rounded bg-secondary flex shrink-0 items-center justify-center text-xs font-mono text-muted-foreground">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => removeField(i)}
                        >
                          <Trash2 className="h-4 w-4" />
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

export default function TemplateBuilderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <TemplateBuilderContent />
    </Suspense>
  );
}
