"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseDeleteDialogOptions {
  removeAnalysis: (id: string) => Promise<void>;
}

interface UseDeleteDialogReturn {
  deletingId: string | null;
  deleteDialogOpen: boolean;
  analysisToDelete: string | null;
  setDeleteDialogOpen: (open: boolean) => void;
  handleDeleteClick: (e: React.MouseEvent, analysisId: string) => void;
  handleConfirmDelete: () => Promise<void>;
}

export function useDeleteDialog({
  removeAnalysis,
}: UseDeleteDialogOptions): UseDeleteDialogReturn {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, analysisId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAnalysisToDelete(analysisId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!analysisToDelete) return;

    setDeletingId(analysisToDelete);
    setDeleteDialogOpen(false);
    try {
      await removeAnalysis(analysisToDelete);
      toast.success("분석이 삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
      setAnalysisToDelete(null);
    }
  };

  return {
    deletingId,
    deleteDialogOpen,
    analysisToDelete,
    setDeleteDialogOpen,
    handleDeleteClick,
    handleConfirmDelete,
  };
}
