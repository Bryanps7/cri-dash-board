import { useEffect, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateObservation, type Lead } from "@/lib/leads";

export function ObservationDialog({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(lead.observation);
  const mutation = useUpdateObservation();

  useEffect(() => {
    if (open) setText(lead.observation);
  }, [open, lead.observation]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-1.5">
          <MessageSquarePlus className="size-4" />
          Observação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Observação — {lead.name || "Lead"}</DialogTitle>
          <DialogDescription>
            O texto abaixo substitui a observação atual deste lead.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          maxLength={1000}
          rows={6}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escreva o que aconteceu no contato com esse lead..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              mutation.mutate(
                { id: lead.id, observation: text.trim() },
                {
                  onSuccess: () => {
                    toast.success("Observação salva");
                    setOpen(false);
                  },
                  onError: (error) => toast.error((error as Error).message),
                },
              );
            }}
          >
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
