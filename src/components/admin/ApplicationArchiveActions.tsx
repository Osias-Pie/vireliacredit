import { useState } from "react";
import { Archive, ArchiveRestore, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  archiveApplication,
  deleteApplicationPermanently,
  restoreApplication,
} from "@/lib/admin-archives.functions";

export type ArchiveActionApplication = {
  id: string;
  reference: string;
  archived_at?: string | null;
};

function useArchiveInvalidation(applicationId: string) {
  const qc = useQueryClient();
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin", "applications"] }),
      qc.invalidateQueries({ queryKey: ["admin", "archives"] }),
      qc.invalidateQueries({ queryKey: ["admin", "archive-count"] }),
      qc.invalidateQueries({ queryKey: ["admin", "application", applicationId] }),
    ]);
  };
}

export function ArchiveApplicationButton({
  application,
  onDone,
  size = "sm",
  variant = "outline",
}: {
  application: ArchiveActionApplication;
  onDone?: () => void;
  size?: "sm" | "default";
  variant?: "outline" | "secondary" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const invalidate = useArchiveInvalidation(application.id);
  const mutation = useMutation({
    mutationFn: () => archiveApplication({ data: { id: application.id } }),
    onSuccess: async () => {
      await invalidate();
      toast.success(`${application.reference} archivé`);
      setOpen(false);
      onDone?.();
    },
    onError: () => toast.error("Impossible d’archiver ce dossier"),
  });

  return (
    <>
      <Button type="button" size={size} variant={variant} onClick={() => setOpen(true)}>
        <Archive className="mr-2 h-4 w-4" /> Archiver
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Il disparaîtra du tableau de bord principal mais restera accessible dans les archives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function RestoreApplicationButton({
  application,
  onDone,
  size = "sm",
}: {
  application: ArchiveActionApplication;
  onDone?: () => void;
  size?: "sm" | "default";
}) {
  const invalidate = useArchiveInvalidation(application.id);
  const mutation = useMutation({
    mutationFn: () => restoreApplication({ data: { id: application.id } }),
    onSuccess: async () => {
      await invalidate();
      toast.success(`${application.reference} restauré`);
      onDone?.();
    },
    onError: () => toast.error("Impossible de restaurer ce dossier"),
  });

  return (
    <Button type="button" size={size} variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArchiveRestore className="mr-2 h-4 w-4" />}
      Restaurer
    </Button>
  );
}

export function DeleteArchivedApplicationButton({
  application,
  onDone,
  size = "sm",
}: {
  application: ArchiveActionApplication;
  onDone?: () => void;
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const invalidate = useArchiveInvalidation(application.id);
  const mutation = useMutation({
    mutationFn: () =>
      deleteApplicationPermanently({
        data: { id: application.id, confirmationReference: confirmation.trim() },
      }),
    onSuccess: async () => {
      await invalidate();
      toast.success(`${application.reference} supprimé définitivement`);
      setConfirmation("");
      setOpen(false);
      onDone?.();
    },
    onError: () => toast.error("Suppression impossible. Vérifiez la référence et réessayez."),
  });

  const matches = confirmation.trim() === application.reference;

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="ghost"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" /> Supprimer définitivement
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmation("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Supprimer définitivement {application.reference} ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera le dossier, les données associées et les fichiers liés. Elle ne pourra pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pour confirmer, saisissez exactement <strong className="font-mono text-foreground">{application.reference}</strong>.
            </p>
            <Input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={application.reference}
              autoComplete="off"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!matches || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ApplicationArchiveControls({
  application,
  onDone,
}: {
  application: ArchiveActionApplication;
  onDone?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Organisation du dossier</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {application.archived_at
              ? "Ce dossier est archivé. Vous pouvez le restaurer ou, en dernier recours, le supprimer définitivement."
              : "L’archivage retire ce dossier du tableau de bord actif sans modifier son statut métier ni son suivi public."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {application.archived_at ? (
            <>
              <RestoreApplicationButton application={application} onDone={onDone} size="default" />
              <DeleteArchivedApplicationButton application={application} onDone={onDone} size="default" />
            </>
          ) : (
            <ArchiveApplicationButton application={application} onDone={onDone} size="default" />
          )}
        </div>
      </div>
    </section>
  );
}
