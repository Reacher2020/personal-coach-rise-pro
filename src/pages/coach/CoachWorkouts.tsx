import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus,
  Search,
  Dumbbell,
  Clock,
  Users,
  Flame,
  ChevronRight,
  Copy,
  Edit,
  MoreHorizontal,
  Trash2,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useState } from "react";
import { useWorkoutPlans, WorkoutPlanInsert } from "@/hooks/useWorkoutPlans";

const Workouts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkoutPlanInsert>({
    name: "",
    description: "",
    duration_minutes: 60,
    difficulty: "medium",
    category: "strength",
    exercises_count: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { workoutPlans, loading, addWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan, getStats } = useWorkoutPlans();

  const filteredPlans = workoutPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (plan.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const stats = getStats();

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "Łatwy";
      case "medium":
        return "Średni";
      case "hard":
        return "Trudny";
      default:
        return difficulty || "Nieokreślony";
    }
  };

  const getCategoryLabel = (category: string | null) => {
    switch (category) {
      case "strength":
        return "Siła";
      case "cardio":
        return "Cardio";
      case "mobility":
        return "Mobilność";
      case "hiit":
        return "HIIT";
      case "endurance":
        return "Wytrzymałość";
      default:
        return category || "Inne";
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "strength":
        return "bg-primary text-primary-foreground";
      case "cardio":
        return "bg-secondary text-secondary-foreground";
      case "mobility":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration_minutes: 60,
      difficulty: "medium",
      category: "strength",
      exercises_count: 0,
    });
    setSelectedPlan(null);
  };

  const handleAddPlan = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    await addWorkoutPlan(formData);
    setIsSubmitting(false);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditPlan = async () => {
    if (!selectedPlan || !formData.name) return;
    setIsSubmitting(true);
    await updateWorkoutPlan(selectedPlan, formData);
    setIsSubmitting(false);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    await deleteWorkoutPlan(selectedPlan);
    setDeleteDialogOpen(false);
    setSelectedPlan(null);
  };

  const openEditDialog = (plan: typeof workoutPlans[0]) => {
    setSelectedPlan(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description,
      duration_minutes: plan.duration_minutes,
      difficulty: plan.difficulty,
      category: plan.category,
      exercises_count: plan.exercises_count,
    });
    setIsEditDialogOpen(true);
  };

  const handleDuplicate = async (plan: typeof workoutPlans[0]) => {
    await addWorkoutPlan({
      name: `${plan.name} (kopia)`,
      description: plan.description,
      duration_minutes: plan.duration_minutes,
      difficulty: plan.difficulty,
      category: plan.category,
      exercises_count: plan.exercises_count,
    });
  };

  const PlanForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nazwa planu *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="np. Full Body Strength"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Opis</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Opis planu treningowego..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Czas trwania (min)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration_minutes || 60}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exercises">Liczba ćwiczeń</Label>
          <Input
            id="exercises"
            type="number"
            value={formData.exercises_count || 0}
            onChange={(e) => setFormData({ ...formData, exercises_count: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Trudność</Label>
          <Select
            value={formData.difficulty || "medium"}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Łatwy</SelectItem>
              <SelectItem value="medium">Średni</SelectItem>
              <SelectItem value="hard">Trudny</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategoria</Label>
          <Select
            value={formData.category || "strength"}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Siła</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="mobility">Mobilność</SelectItem>
              <SelectItem value="hiit">HIIT</SelectItem>
              <SelectItem value="endurance">Wytrzymałość</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onSubmit} disabled={!formData.name || isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Plany treningowe
            </h1>
            <p className="text-muted-foreground">
              Twórz i zarządzaj programami treningowymi
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-glow" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nowy plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nowy plan treningowy</DialogTitle>
                <DialogDescription>
                  Utwórz nowy plan treningowy dla swoich klientów
                </DialogDescription>
              </DialogHeader>
              <PlanForm onSubmit={handleAddPlan} submitLabel="Dodaj plan" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPlans}</p>
                <p className="text-sm text-muted-foreground">Planów</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalAssignments}</p>
                <p className="text-sm text-muted-foreground">Przypisań</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/50 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalExercises}</p>
                <p className="text-sm text-muted-foreground">Ćwiczeń</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj planu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Workout Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge className={getCategoryColor(plan.category)}>
                          {getCategoryLabel(plan.category)}
                        </Badge>
                        <CardTitle className="text-foreground text-lg mt-2">
                          {plan.name}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edytuj
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(plan)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplikuj
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedPlan(plan.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Usuń
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description || "Brak opisu"}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getDifficultyColor(plan.difficulty)}>
                        {getDifficultyLabel(plan.difficulty)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{plan.duration_minutes || 0} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-4 w-4" />
                        <span>{plan.exercises_count || 0} ćwiczeń</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{plan.assigned_clients_count || 0}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Zobacz szczegóły
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPlans.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {workoutPlans.length === 0 ? "Brak planów treningowych" : "Nie znaleziono planów"}
                  </h3>
                  <p className="text-muted-foreground">
                    {workoutPlans.length === 0
                      ? "Utwórz pierwszy plan treningowy dla swoich klientów"
                      : "Spróbuj zmienić kryteria wyszukiwania"}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edytuj plan treningowy</DialogTitle>
              <DialogDescription>
                Wprowadź zmiany w planie treningowym
              </DialogDescription>
            </DialogHeader>
            <PlanForm onSubmit={handleEditPlan} submitLabel="Zapisz zmiany" />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć ten plan?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna. Plan zostanie trwale usunięty wraz ze wszystkimi przypisaniami do klientów.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePlan} className="bg-destructive text-destructive-foreground">
                Usuń
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Workouts;
