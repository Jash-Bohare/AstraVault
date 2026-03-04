import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmationData {
  from: string;
  to: string;
  amount: string;
  gas: string;
  total: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  data: ConfirmationData;
}

const rawJsonPlaceholder = {
  type: "0x2",
  chainId: "0x1",
  to: "...",
  value: "...",
  gasLimit: "0x5208",
};

export function ConfirmationModal({ open, onClose, onConfirm, loading, data }: Props) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg">Confirm Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {[
            { label: "From", value: data.from },
            { label: "To", value: data.to },
            { label: "Amount", value: data.amount },
            { label: "Gas Cost", value: data.gas },
            { label: "Total Cost", value: data.total },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-start">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{row.label}</span>
              <span className="text-sm font-mono text-foreground text-right max-w-[60%] break-all">{row.value}</span>
            </div>
          ))}

          {/* Raw JSON toggle */}
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-primary hover:underline"
          >
            {showRaw ? "Hide" : "Show"} Raw Transaction
          </button>

          {showRaw && (
            <div className="console-bg rounded-lg p-4 overflow-auto max-h-48 animate-fade-in">
              <pre className="text-xs font-mono text-primary/80">{JSON.stringify(rawJsonPlaceholder, null, 2)}</pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="glow-amber-strong bg-primary text-black font-bold h-12 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all"
            >
              Confirm Transaction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
