"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone. This will permanently delete the template.",
    loading = false,
}: DeleteConfirmationModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-50">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={onClose}
                        disabled={loading}
                        className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                        className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
