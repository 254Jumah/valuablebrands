'use client';
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Phone,
  Mail,
  MessageCircle,
  Plus,
  Check,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const channelIcons = {
  Call: Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
};

const channelColors = {
  Call: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  WhatsApp:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Email:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'Done':
      return 'default';
    case 'Sent':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function RemindersPanel({
  registrationId,
  reminders = [],
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [channel, setChannel] = useState('Call');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [note, setNote] = useState('');

  const handleAddReminder = () => {
    if (!scheduledDate) return;

    const scheduledFor = new Date(
      `${scheduledDate}T${scheduledTime}:00`
    ).toISOString();

    if (onAddReminder) {
      onAddReminder(registrationId, {
        channel,
        scheduledFor,
        status: 'Planned',
        note: note.trim() || undefined,
      });
    }

    // Reset form
    setChannel('Call');
    setScheduledDate('');
    setScheduledTime('09:00');
    setNote('');
    setDialogOpen(false);
  };

  const handleMarkStatus = (reminderId, status) => {
    if (onUpdateReminder) {
      onUpdateReminder(registrationId, reminderId, { status });
    }
  };

  const handleDeleteReminder = (reminderId) => {
    if (onDeleteReminder) {
      onDeleteReminder(registrationId, reminderId);
    }
  };

  const sortedReminders = [...reminders].sort(
    (a, b) =>
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Reminders & Follow-ups
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule reminder</DialogTitle>
              <DialogDescription>
                Plan a follow-up call, WhatsApp, or email for this registration.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">📞 Call</SelectItem>
                    <SelectItem value="WhatsApp">💬 WhatsApp</SelectItem>
                    <SelectItem value="Email">📧 Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <Textarea
                  placeholder="What should you remember to discuss?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReminder} disabled={!scheduledDate}>
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sortedReminders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No reminders scheduled yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReminders.map((rm) => {
            const Icon = channelIcons[rm.channel];
            const isCompleted = rm.status === 'Done' || rm.status === 'Sent';

            return (
              <div
                key={rm.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-border bg-card p-3',
                  isCompleted && 'opacity-60'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    channelColors[rm.channel]
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {rm.channel}
                    </span>
                    <Badge
                      variant={statusBadgeVariant(rm.status)}
                      className="text-xs"
                    >
                      {rm.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(rm.scheduledFor),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                  {rm.note && (
                    <p className="mt-1 text-sm text-foreground">{rm.note}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!isCompleted && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Mark as Sent"
                        onClick={() => handleMarkStatus(rm.id, 'Sent')}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600"
                        title="Mark as Done"
                        onClick={() => handleMarkStatus(rm.id, 'Done')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete reminder?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this reminder from the
                          log.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteReminder(rm.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
