import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/atoms/dialog';
import { Button } from '@/components';

interface PermissionDeniedDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export const PermissionDeniedDialog: React.FC<PermissionDeniedDialogProps> = ({ open, onClose, message }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permission Denied</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {message || "You don't have permission to perform this action."}
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="primary" onClick={onClose}>OK</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
