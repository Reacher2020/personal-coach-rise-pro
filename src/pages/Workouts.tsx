import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  exercises: number;
  assignedClients: number;
  category: string;
}

const Workouts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const workoutPlans: WorkoutPlan[] = [
    {
      id: 1,
      name: "Full Body Strength",
      description: "Kompleksowy trening siłowy na całe ciało dla zaawansowanych",
      duration: "60 min",
      difficulty: "advanced",
      exercises: 12,
      assignedClients: 8,
      category: "Siła"
    },
    {
      id: 2,
      name: "HIIT Cardio Blast",
      description: "Intensywny trening interwałowy spalający kalorie",
      duration: "45 min",
      difficulty: "intermediate",
      exercises: 10,
      assignedClients: 12,
      category: "Cardio"
    },
    {
      id: 3,
      name: "Beginner Fundamentals",
      description: "Podstawy treningu dla początkujących z naciskiem na technikę",
      duration: "45 min",
      difficulty: "beginner",
      exercises: 8,
      assignedClients: 5,
      category: "Podstawy"
    },
    {
      id: 4,
      name: "Core & Flexibility",
      description: "Trening core i rozciąganie dla lepszej mobilności",
      duration: "30 min",
      difficulty: "beginner",
      exercises: 15,
      assignedClients: 10,
      category: "Mobilność"
    },
    {
      id: 5,
      name: "Upper Body Power",
      description: "Intensywny trening górnych partii ciała",
      duration: "50 min",
      difficulty: "intermediate",
      exercises: 10,
      assignedClients: 6,
      category: "Siła"
    },
    {
      id: 6,
      name: "Leg Day Extreme",
      description: "Zaawansowany trening nóg i pośladków",
      duration: "55 min",
      difficulty: "advanced",
      exercises: 9,
      assignedClients: 4,
      category: "Siła"
    }
  ];

  const filteredPlans = workoutPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Początkujący";
      case "intermediate":
        return "Średniozaawansowany";
      case "advanced":
        return "Zaawansowany";
      default:
        return difficulty;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Siła":
        return "bg-primary text-primary-foreground";
      case "Cardio":
        return "bg-secondary text-secondary-foreground";
      case "Mobilność":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="lg:ml-64">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className="p-4 lg:p-6 space-y-6">
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
            <Button className="bg-primary text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nowy plan
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{workoutPlans.length}</p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {workoutPlans.reduce((acc, plan) => acc + plan.assignedClients, 0)}
                  </p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {workoutPlans.reduce((acc, plan) => acc + plan.exercises, 0)}
                  </p>
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

          {/* Workout Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Badge className={getCategoryColor(plan.category)}>
                        {plan.category}
                      </Badge>
                      <CardTitle className="text-foreground text-lg mt-2">
                        {plan.name}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplikuj
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getDifficultyColor(plan.difficulty)}>
                      {getDifficultyLabel(plan.difficulty)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{plan.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dumbbell className="h-4 w-4" />
                      <span>{plan.exercises} ćwiczeń</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{plan.assignedClients}</span>
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
                  Nie znaleziono planów
                </h3>
                <p className="text-muted-foreground">
                  Spróbuj zmienić kryteria wyszukiwania
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default Workouts;
