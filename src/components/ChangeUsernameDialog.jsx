import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { changeAdminUsername } from '@/lib/storage';

export const ChangeUsernameDialog = ({ admin, isOpen, onOpenChange, onSuccess }) => {
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setNewUsername('');
      setPassword('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newUsername || !password) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    const result = changeAdminUsername(admin.id, password, newUsername);
    
    if (result.success) {
      toast({ title: "Success", description: result.message });
      onSuccess();
      onOpenChange(false);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Username for {admin?.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newUsername">New Username</Label>
            <Input 
              id="newUsername" 
              type="text" 
              value={newUsername} 
              onChange={e => setNewUsername(e.target.value)} 
              placeholder="Enter new username" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Verify Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter your current password" 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Update Username</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};