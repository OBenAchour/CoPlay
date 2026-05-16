import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { CoachingHomeComponent } from './components/coaching-home.component';
import { ProgramsComponent } from './components/programs.component';
import { ExercisesComponent } from './components/exercises.component';
import { InjuriesComponent } from './components/injuries.component';
import { NutritionComponent } from './components/nutrition.component';
import { HydrationComponent } from './components/hydration.component';
import { ProgressComponent } from './components/progress.component';
import { MedicalComponent } from './components/medical.component';
import { AiCoachComponent } from './components/ai-coach.component';
import { CoachesComponent } from './components/coaches.component';
import { SharedModule } from '../../Shared/shared.module';

const routes: Routes = [
  { path: '', component: CoachingHomeComponent },
  { path: 'programs', component: ProgramsComponent },
  { path: 'exercises', component: ExercisesComponent },
  { path: 'injuries', component: InjuriesComponent },
  { path: 'nutrition', component: NutritionComponent },
  { path: 'hydration', component: HydrationComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'medical', component: MedicalComponent },
  { path: 'ai', component: AiCoachComponent },
  { path: 'coaches', component: CoachesComponent },
];

@NgModule({
  declarations: [
    CoachingHomeComponent,
    ProgramsComponent,
    ExercisesComponent,
    InjuriesComponent,
    NutritionComponent,
    HydrationComponent,
    ProgressComponent,
    MedicalComponent,
    AiCoachComponent,
    CoachesComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), SharedModule],
})
export class CoachingModule {}
