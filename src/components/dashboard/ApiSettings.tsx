import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DEFAULT_API_BASE, getApiBase, setApiBase } from "@/lib/api";
import { toast } from "sonner";

export function ApiSettings() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(DEFAULT_API_BASE);
  const queryClient = useQueryClient();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setValue(getApiBase());
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="header" size="sm" className="gap-2">
          <Settings2 className="size-4" />
          Servidor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Endereço do servidor de leads</DialogTitle>
          <DialogDescription>
            Endereço onde a sua API de leads está rodando. Padrão: {DEFAULT_API_BASE}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="api-base">Endereço</Label>
          <Input
            id="api-base"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={DEFAULT_API_BASE}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setApiBase(value.trim() || DEFAULT_API_BASE);
              queryClient.invalidateQueries({ queryKey: ["leads"] });
              toast.success("Endereço salvo");
              setOpen(false);
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
