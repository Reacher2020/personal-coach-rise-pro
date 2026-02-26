import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Calendar, TrendingUp, MoreVertical, Pencil, Trash2, Loader2, ClipboardList } from "lucide-react";
import { ClientSurveyDialog } from "./ClientSurveyDialog";

interface ClientCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userId?: string | null;
  status: "active" | "inactive" | "new";
  nextSession?: string;
  progress: number;
  onUpdate?: (id: string, data: { name: string; email: string | null; phone: string | null; status: string; progress: number }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ClientCard = ({
  id,
  name,
  email,
  phone,
  userId,
  status,
  nextSession,
  progress,
  onUpdate,
  onDelete,
}: ClientCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone || "");
  const [editStatus, setEditStatus] = useState(status);
  const [editProgress, setEditProgress] = useState(progress);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground";
      case "new":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktywny";
      case "new":
        return "Nowy";
      default:
        return "Nieaktywny";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleEdit = async () => {
    if (!onUpdate || !editName.trim()) return;
    
    setIsLoading(true);
    await onUpdate(id, {
      name: editName,
      email: editEmail || null,
      phone: editPhone || null,
      status: editStatus,
      progress: editProgress,
    });
    setIsLoading(false);
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsLoading(true);
    await onDelete(id);
    setIsLoading(false);
    setIsDeleteOpen(false);
  };

  const openEditDialog = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone || "");
    setEditStatus(status);
    setEditProgress(progress);
    setIsEditOpen(true);
  };

  return (
    <>
      <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-primary text-hero-foreground font-semibold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(status)}>
                {getStatusLabel(status)}
              </Badge>
              {(onUpdate || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onUpdate && (
                      <DropdownMenuItem onClick={openEditDialog}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edytuj
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Usuń
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {nextSession && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span>Następna sesja: {nextSession}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <TrendingUp className="h-4 w-4" />
            <span>Postęp: {progress}%</span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Wiadomość
            </Button>
            {userId && (
              <Button variant="outline" size="sm" onClick={() => setIsSurveyOpen(true)}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Ankieta
              </Button>
            )}
            <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
              Zobacz profil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj klienta</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane klienta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Imię i nazwisko *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editStatus} onValueChange={(val) => setEditStatus(val as "active" | "inactive" | "new")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nowy</SelectItem>
                  <SelectItem value="active">Aktywny</SelectItem>
                  <SelectItem value="inactive">Nieaktywny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-progress">Postęp ({editProgress}%)</Label>
              <Input
                id="edit-progress"
                type="range"
                min="0"
                max="100"
                value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                className="cursor-pointer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleEdit} disabled={isLoading || !editName.trim()}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń klienta</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć klienta <strong>{name}</strong>? Ta
              akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Survey Dialog */}
      <ClientSurveyDialog
        open={isSurveyOpen}
        onOpenChange={setIsSurveyOpen}
        clientName={name}
        clientUserId={userId || null}
      />
    </>
  );
};
