import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Clean existing data (reverse dependency order) ──
  await prisma.sessionSet.deleteMany()
  await prisma.workoutSession.deleteMany()
  await prisma.programAssignment.deleteMany()
  await prisma.personalRecord.deleteMany()
  await prisma.progressPhoto.deleteMany()
  await prisma.bodyMeasurement.deleteMany()
  await prisma.phaseExerciseConfig.deleteMany()
  await prisma.workoutExercise.deleteMany()
  await prisma.rotationSlot.deleteMany()
  await prisma.weeklyRotation.deleteMany()
  await prisma.programTip.deleteMany()
  await prisma.workout.deleteMany()
  await prisma.trainingPhase.deleteMany()
  await prisma.trainingProgram.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.trainerProfile.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleaned existing data.')

  // ── 1. Create Users ──
  const professorPassword = await hash('Tron@2024', 12)
  const alunoPassword = await hash('Aluno@2024', 12)

  const professor = await prisma.user.create({
    data: {
      email: 'professor@tron.app',
      passwordHash: professorPassword,
      name: 'Professor TRON',
      role: 'TRAINER',
    },
  })

  const aluno = await prisma.user.create({
    data: {
      email: 'aluno@tron.app',
      passwordHash: alunoPassword,
      name: 'Aluno Demo',
      role: 'STUDENT',
    },
  })

  console.log('Users created.')

  // ── 2. Create Profiles ──
  const trainerProfile = await prisma.trainerProfile.create({
    data: {
      userId: professor.id,
    },
  })

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: aluno.id,
      trainerId: trainerProfile.id,
      gender: 'MALE',
    },
  })

  console.log('Profiles created.')

  // ── 3. Create all 27 exercises ──
  const exercisesData = [
    { name: 'Supino Reto', equipmentOptions: 'Smith / Livre / Halter / Máquina', muscleGroups: ['Peito', 'Tríceps', 'Ombro Anterior'], videoUrl: 'https://www.youtube.com/watch?v=XsgR_hm8AWA' },
    { name: 'Crucifixo Reto', equipmentOptions: 'Halter / Cabo / Máquina', muscleGroups: ['Peito'], videoUrl: 'https://www.youtube.com/watch?v=uQIPgsELvgs' },
    { name: 'Desenvolvimento', equipmentOptions: 'Halter / Máquina / Smith', muscleGroups: ['Ombro Anterior', 'Ombro Lateral', 'Tríceps'], videoUrl: 'https://www.youtube.com/watch?v=bFuat5b4QFA' },
    { name: 'Elevações Laterais', equipmentOptions: 'Halter / Máquina', muscleGroups: ['Ombro Lateral'], videoUrl: 'https://www.youtube.com/watch?v=nxCKW-unul0' },
    { name: 'Puxada Aberta Pronada', equipmentOptions: null, muscleGroups: ['Dorsal', 'Bíceps'], videoUrl: 'https://www.youtube.com/shorts/ftcql3-AMRs' },
    { name: 'Remada Curvada Pronada', equipmentOptions: 'Barra Livre / Smith', muscleGroups: ['Dorsal', 'Trapézio', 'Bíceps'], videoUrl: 'https://www.youtube.com/watch?v=2Zdzq5I-EuI' },
    { name: 'Rosca Direta com Barra W', equipmentOptions: null, muscleGroups: ['Bíceps'], videoUrl: 'https://www.youtube.com/watch?v=rc_7r56M3So' },
    { name: 'Tríceps Francês', equipmentOptions: 'Halter / Barra W', muscleGroups: ['Tríceps'], videoUrl: 'https://www.youtube.com/watch?v=4piO_WPmCCE' },
    { name: 'Agachamento', equipmentOptions: 'Livre / Smith / Hack', muscleGroups: ['Quadríceps', 'Glúteo'], videoUrl: 'https://www.youtube.com/watch?v=bkDka7InYsY' },
    { name: 'Leg Press', equipmentOptions: null, muscleGroups: ['Quadríceps', 'Glúteo'], videoUrl: 'https://www.youtube.com/watch?v=B0swveEoTnU' },
    { name: 'Cadeira Extensora', equipmentOptions: null, muscleGroups: ['Quadríceps'], videoUrl: 'https://www.youtube.com/watch?v=BHxNa16VQ7A' },
    { name: 'Mesa/Cadeira Flexora', equipmentOptions: null, muscleGroups: ['Posterior de Coxa'], videoUrl: 'https://www.youtube.com/watch?v=cuWo-F7HDhY' },
    { name: 'Cadeira Adutora', equipmentOptions: null, muscleGroups: ['Adutores'], videoUrl: 'https://www.youtube.com/watch?v=C7eVG0crT6c' },
    { name: 'Panturrilha em Pé', equipmentOptions: 'Máquina / Livre', muscleGroups: ['Panturrilha'], videoUrl: 'https://www.youtube.com/watch?v=xU9KCMZkoxo' },
    { name: 'Abdominal Prancha', equipmentOptions: null, muscleGroups: ['Core', 'Reto Abdominal'], videoUrl: 'https://www.youtube.com/shorts/8GFqPC0I0sA' },
    { name: 'Supino Inclinado', equipmentOptions: 'Smith / Livre / Halter / Máquina', muscleGroups: ['Peito Superior', 'Tríceps', 'Ombro Anterior'], videoUrl: 'https://www.youtube.com/watch?v=lmwCGtNJmw0' },
    { name: 'Crucifixo Inclinado', equipmentOptions: 'Halter / Cabo / Máquina', muscleGroups: ['Peito Superior'], videoUrl: 'https://www.youtube.com/watch?v=s71yh_Pxvk8' },
    { name: 'Elevações Frontais', equipmentOptions: 'Halter / Barra Pronada', muscleGroups: ['Ombro Anterior'], videoUrl: 'https://www.youtube.com/watch?v=dmihuuva9KU' },
    { name: 'Crucifixo Inverso', equipmentOptions: 'Halter / Máquina', muscleGroups: ['Ombro Posterior', 'Trapézio'], videoUrl: 'https://www.youtube.com/watch?v=8pM2FNouJEc' },
    { name: 'Puxada Alta com Triângulo', equipmentOptions: null, muscleGroups: ['Dorsal', 'Bíceps'], videoUrl: 'https://www.youtube.com/watch?v=r7dgDP2N-DM' },
    { name: 'Remada Baixa Supinada', equipmentOptions: 'Barra Livre / Smith', muscleGroups: ['Dorsal', 'Bíceps', 'Trapézio'], videoUrl: 'https://www.youtube.com/shorts/YiBlwb32gqo' },
    { name: 'Rosca Alternada no Banco Inclinado', equipmentOptions: null, muscleGroups: ['Bíceps'], videoUrl: 'https://www.youtube.com/watch?v=xcDpo1Ubi5k' },
    { name: 'Tríceps Corda', equipmentOptions: null, muscleGroups: ['Tríceps'], videoUrl: 'https://www.youtube.com/watch?v=vzItkqTEq20' },
    { name: 'Elevações Pélvicas', equipmentOptions: 'Livre / Smith / Máquina', muscleGroups: ['Glúteo', 'Posterior de Coxa'], videoUrl: 'https://www.youtube.com/watch?v=JSRjx5pB5aM' },
    { name: 'Levantamento Terra Romano', equipmentOptions: null, muscleGroups: ['Posterior de Coxa', 'Glúteo', 'Lombar'], videoUrl: 'https://www.youtube.com/watch?v=PCa66EQ6nrw' },
    { name: 'Leg Press Unilateral', equipmentOptions: null, muscleGroups: ['Quadríceps', 'Glúteo'], videoUrl: 'https://www.youtube.com/watch?v=B0swveEoTnU' },
    { name: 'Abdominal Crunch', equipmentOptions: null, muscleGroups: ['Reto Abdominal'], videoUrl: 'https://www.youtube.com/watch?v=27hLFDTivBg' },
  ]

  const exercises: Record<string, { id: string; name: string }> = {}

  for (const ex of exercisesData) {
    const created = await prisma.exercise.create({
      data: {
        name: ex.name,
        equipmentOptions: ex.equipmentOptions,
        muscleGroups: ex.muscleGroups,
        videoUrl: ex.videoUrl,
      },
    })
    exercises[ex.name] = created
  }

  console.log('Exercises created.')

  // ── 4. Create Training Program ──
  const program = await prisma.trainingProgram.create({
    data: {
      name: 'Iniciante Masculino — Upper/Lower 16 Semanas',
      durationWeeks: 16,
      isTemplate: true,
      createdById: trainerProfile.id,
    },
  })

  console.log('Program created.')

  // ── 5. Create Training Phases ──
  const phase1 = await prisma.trainingPhase.create({
    data: {
      programId: program.id,
      weekStart: 1,
      weekEnd: 4,
      name: 'Aprendizado Motor',
      description: 'Foco em aprender a técnica correta de cada exercício com cargas leves a moderadas. Priorize amplitude de movimento e controle excêntrico.',
      color: '#FF3B30',
      orderIndex: 0,
    },
  })

  const phase2 = await prisma.trainingPhase.create({
    data: {
      programId: program.id,
      weekStart: 5,
      weekEnd: 8,
      name: 'Progressão de Carga',
      description: 'Início da progressão de carga com introdução de clusters e backoff sets. Aumente o peso gradualmente mantendo a técnica.',
      color: '#FF9500',
      orderIndex: 1,
    },
  })

  const phase3 = await prisma.trainingPhase.create({
    data: {
      programId: program.id,
      weekStart: 9,
      weekEnd: 12,
      name: 'Consolidação',
      description: 'Consolidação dos ganhos com volume aumentado nos clusters. Foco em consistência e qualidade das repetições.',
      color: '#AF52DE',
      orderIndex: 2,
    },
  })

  const phase4 = await prisma.trainingPhase.create({
    data: {
      programId: program.id,
      weekStart: 13,
      weekEnd: 16,
      name: 'Intensidade',
      description: 'Fase de intensidade máxima com descanso intra-série reduzido. Teste seus limites com técnica perfeita.',
      color: '#30D158',
      orderIndex: 3,
    },
  })

  const phases = [phase1, phase2, phase3, phase4]

  console.log('Phases created.')

  // ── 6. Create Workouts with WorkoutExercises ──

  // Helper to create JSON config strings
  const js = (obj: unknown) => JSON.stringify(obj)

  // --- Upper Body 1 ---
  const upperBody1 = await prisma.workout.create({
    data: {
      programId: program.id,
      name: 'Upper Body 1',
      icon: '💪',
      orderIndex: 0,
      category: 'UPPER',
    },
  })

  const ub1Exercises = [
    { name: 'Supino Reto', hasWarmup: true, warmupConfig: js({ sets: 2, reps: '15–20', note: 'carga moderada' }), feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
    { name: 'Crucifixo Reto', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
    { name: 'Desenvolvimento', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
    { name: 'Elevações Laterais', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
    { name: 'Puxada Aberta Pronada', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
    { name: 'Remada Curvada Pronada', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
    { name: 'Rosca Direta com Barra W', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
    { name: 'Tríceps Francês', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '1–2min' }) },
  ]

  const ub1WorkoutExercises = []
  for (let i = 0; i < ub1Exercises.length; i++) {
    const ex = ub1Exercises[i]
    const we = await prisma.workoutExercise.create({
      data: {
        workoutId: upperBody1.id,
        exerciseId: exercises[ex.name].id,
        orderIndex: i,
        hasWarmup: ex.hasWarmup,
        warmupConfig: ex.warmupConfig,
        feeder1Config: ex.feeder1Config,
        feeder2Config: ex.feeder2Config,
      },
    })
    ub1WorkoutExercises.push({ ...we, exerciseName: ex.name })
  }

  // --- Lower Body 1 ---
  const lowerBody1 = await prisma.workout.create({
    data: {
      programId: program.id,
      name: 'Lower Body 1',
      icon: '🦵',
      orderIndex: 1,
      category: 'LOWER',
    },
  })

  const lb1Exercises = [
    { name: 'Agachamento', hasWarmup: true, warmupConfig: js({ sets: 2, reps: '15–20', note: 'carga moderada' }), feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Leg Press', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Cadeira Extensora', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '6–8', rest: '1min' }), feeder2Config: js({ reps: '6–8', rest: '2min' }) },
    { name: 'Mesa/Cadeira Flexora', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '6–8', rest: '1min' }), feeder2Config: js({ reps: '6–8', rest: '1min' }) },
    { name: 'Cadeira Adutora', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '6–8', rest: '1min' }), feeder2Config: js({ reps: '6–8', rest: '1min' }) },
    { name: 'Panturrilha em Pé', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '8–10', rest: '1min' }), feeder2Config: js({ reps: '8–10', rest: '2min' }) },
    { name: 'Abdominal Prancha', hasWarmup: false, warmupConfig: null, feeder1Config: null, feeder2Config: null },
  ]

  const lb1WorkoutExercises = []
  for (let i = 0; i < lb1Exercises.length; i++) {
    const ex = lb1Exercises[i]
    const we = await prisma.workoutExercise.create({
      data: {
        workoutId: lowerBody1.id,
        exerciseId: exercises[ex.name].id,
        orderIndex: i,
        hasWarmup: ex.hasWarmup,
        warmupConfig: ex.warmupConfig,
        feeder1Config: ex.feeder1Config,
        feeder2Config: ex.feeder2Config,
      },
    })
    lb1WorkoutExercises.push({ ...we, exerciseName: ex.name })
  }

  // --- Upper Body 2 ---
  const upperBody2 = await prisma.workout.create({
    data: {
      programId: program.id,
      name: 'Upper Body 2',
      icon: '🏋️',
      orderIndex: 2,
      category: 'UPPER',
    },
  })

  const ub2Exercises = [
    { name: 'Supino Inclinado', hasWarmup: true, warmupConfig: js({ sets: 2, reps: '15–20', note: 'carga moderada' }), feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Crucifixo Inclinado', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Elevações Frontais', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Crucifixo Inverso', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Puxada Alta com Triângulo', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Remada Baixa Supinada', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Rosca Alternada no Banco Inclinado', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Tríceps Corda', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
  ]

  const ub2WorkoutExercises = []
  for (let i = 0; i < ub2Exercises.length; i++) {
    const ex = ub2Exercises[i]
    const we = await prisma.workoutExercise.create({
      data: {
        workoutId: upperBody2.id,
        exerciseId: exercises[ex.name].id,
        orderIndex: i,
        hasWarmup: ex.hasWarmup,
        warmupConfig: ex.warmupConfig,
        feeder1Config: ex.feeder1Config,
        feeder2Config: ex.feeder2Config,
      },
    })
    ub2WorkoutExercises.push({ ...we, exerciseName: ex.name })
  }

  // --- Lower Body 2 ---
  const lowerBody2 = await prisma.workout.create({
    data: {
      programId: program.id,
      name: 'Lower Body 2',
      icon: '🔥',
      orderIndex: 3,
      category: 'LOWER',
    },
  })

  const lb2Exercises = [
    { name: 'Elevações Pélvicas', hasWarmup: true, warmupConfig: js({ sets: 2, reps: '15–20', note: 'carga moderada' }), feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Mesa/Cadeira Flexora', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '5–6', rest: '2min' }) },
    { name: 'Levantamento Terra Romano', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '6–8', rest: '2min' }) },
    { name: 'Leg Press Unilateral', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '6–8', rest: '1min' }) },
    { name: 'Panturrilha em Pé', hasWarmup: false, warmupConfig: null, feeder1Config: js({ reps: '5–6', rest: '1min' }), feeder2Config: js({ reps: '8–10', rest: '1min' }) },
    { name: 'Abdominal Crunch', hasWarmup: false, warmupConfig: null, feeder1Config: null, feeder2Config: null },
  ]

  const lb2WorkoutExercises = []
  for (let i = 0; i < lb2Exercises.length; i++) {
    const ex = lb2Exercises[i]
    const we = await prisma.workoutExercise.create({
      data: {
        workoutId: lowerBody2.id,
        exerciseId: exercises[ex.name].id,
        orderIndex: i,
        hasWarmup: ex.hasWarmup,
        warmupConfig: ex.warmupConfig,
        feeder1Config: ex.feeder1Config,
        feeder2Config: ex.feeder2Config,
      },
    })
    lb2WorkoutExercises.push({ ...we, exerciseName: ex.name })
  }

  console.log('Workouts and workout exercises created.')

  // ── 7. Create PhaseExerciseConfigs ──

  // Default configs per phase
  const defaultPhaseConfigs = [
    { phase: phase1, workingSetConfig: js({ type: 'straight', sets: 2, reps: '8–10', rest: '2–3min' }), backoffConfig: null },
    { phase: phase2, workingSetConfig: js({ type: 'cluster', blocks: 3, repsPerBlock: '3–4', intraRest: '20s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
    { phase: phase3, workingSetConfig: js({ type: 'cluster', blocks: 4, repsPerBlock: '3–4', intraRest: '20s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
    { phase: phase4, workingSetConfig: js({ type: 'cluster', blocks: '3–4', repsPerBlock: '3–4', intraRest: '10s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
  ]

  // Panturrilha exception configs
  const panturrilhaPhaseConfigs = [
    { phase: phase1, workingSetConfig: js({ type: 'straight', sets: 2, reps: '12–15', rest: '1–2min' }), backoffConfig: null },
    { phase: phase2, workingSetConfig: js({ type: 'cluster', blocks: 3, repsPerBlock: '3–4', intraRest: '20s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
    { phase: phase3, workingSetConfig: js({ type: 'cluster', blocks: 4, repsPerBlock: '5–6', intraRest: '20s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
    { phase: phase4, workingSetConfig: js({ type: 'cluster', blocks: '3–4', repsPerBlock: '5–6', intraRest: '10s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
  ]

  // Leg Press Unilateral exception configs
  const legPressUniPhaseConfigs = [
    { phase: phase1, workingSetConfig: js({ type: 'straight', sets: 2, reps: '10–12', rest: '1–2min' }), backoffConfig: null },
    { phase: phase2, workingSetConfig: js({ type: 'cluster', blocks: 3, repsPerBlock: '3–4', intraRest: '20s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
    { phase: phase3, workingSetConfig: js({ type: 'cluster', blocks: 4, repsPerBlock: '3–4', intraRest: '20s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
    { phase: phase4, workingSetConfig: js({ type: 'cluster', blocks: '3–4', repsPerBlock: '3–4', intraRest: '10s' }), backoffConfig: js({ reps: '10–12', rest: '1–2min' }) },
  ]

  // Abdominal Prancha exception configs
  const abPranchaPhaseConfigs = [
    { phase: phase1, workingSetConfig: js({ type: 'straight', sets: 4, reps: '15–20', rest: '1min' }), backoffConfig: null },
    { phase: phase2, workingSetConfig: js({ type: 'straight', sets: 4, reps: '15–20', rest: '1min' }), backoffConfig: null },
    { phase: phase3, workingSetConfig: js({ type: 'straight', sets: 4, reps: '15–20', rest: '1min' }), backoffConfig: null },
    { phase: phase4, workingSetConfig: js({ type: 'isometric', sets: 4, duration: '1min', rest: '1min' }), backoffConfig: null },
  ]

  // Abdominal Crunch exception configs
  const abCrunchPhaseConfigs = [
    { phase: phase1, workingSetConfig: js({ type: 'straight', sets: 4, reps: '15–20', rest: '1min' }), backoffConfig: null },
    { phase: phase2, workingSetConfig: js({ type: 'straight', sets: 4, reps: '15–20', rest: '1min' }), backoffConfig: null },
    { phase: phase3, workingSetConfig: js({ type: 'straight', sets: 4, reps: '15–20', rest: '1min' }), backoffConfig: null },
    { phase: phase4, workingSetConfig: js({ type: 'straight', sets: 4, reps: '15–20', rest: '1min' }), backoffConfig: null },
  ]

  // Function to get the right config for a workout exercise
  function getPhaseConfigs(exerciseName: string): Array<{ phase: typeof phase1; workingSetConfig: string; backoffConfig: string | null }> {
    if (exerciseName === 'Panturrilha em Pé') return panturrilhaPhaseConfigs
    if (exerciseName === 'Leg Press Unilateral') return legPressUniPhaseConfigs
    if (exerciseName === 'Abdominal Prancha') return abPranchaPhaseConfigs
    if (exerciseName === 'Abdominal Crunch') return abCrunchPhaseConfigs
    return defaultPhaseConfigs
  }

  // Create phase configs for all workout exercises across all workouts
  const allWorkoutExercises = [
    ...ub1WorkoutExercises,
    ...lb1WorkoutExercises,
    ...ub2WorkoutExercises,
    ...lb2WorkoutExercises,
  ]

  for (const we of allWorkoutExercises) {
    const configs = getPhaseConfigs(we.exerciseName)
    for (const config of configs) {
      await prisma.phaseExerciseConfig.create({
        data: {
          phaseId: config.phase.id,
          workoutExerciseId: we.id,
          workingSetConfig: config.workingSetConfig,
          backoffConfig: config.backoffConfig,
        },
      })
    }
  }

  console.log('Phase exercise configs created.')

  // ── 8. Create Weekly Rotations ──

  // Helper: 0=Monday, 1=Tuesday, ... 6=Sunday
  async function createRotation(
    label: string,
    orderIndex: number,
    slots: Array<{ day: number; workoutId: string | null; isRest: boolean; displayLabel: string }>,
  ) {
    const rotation = await prisma.weeklyRotation.create({
      data: {
        programId: program.id,
        label,
        orderIndex,
      },
    })
    for (const slot of slots) {
      await prisma.rotationSlot.create({
        data: {
          rotationId: rotation.id,
          dayOfWeek: slot.day,
          workoutId: slot.workoutId,
          isRest: slot.isRest,
          displayLabel: slot.displayLabel,
        },
      })
    }
    return rotation
  }

  // 4× Semana
  await createRotation('4× Semana', 0, [
    { day: 0, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 1, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 2, workoutId: null, isRest: true, displayLabel: '—' },
    { day: 3, workoutId: upperBody2.id, isRest: false, displayLabel: 'C' },
    { day: 4, workoutId: lowerBody2.id, isRest: false, displayLabel: 'D' },
    { day: 5, workoutId: null, isRest: true, displayLabel: '—' },
    { day: 6, workoutId: null, isRest: true, displayLabel: '—' },
  ])

  // 5× Semana
  await createRotation('5× Semana', 1, [
    { day: 0, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 1, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 2, workoutId: upperBody2.id, isRest: false, displayLabel: 'C' },
    { day: 3, workoutId: lowerBody2.id, isRest: false, displayLabel: 'D' },
    { day: 4, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 5, workoutId: null, isRest: true, displayLabel: '—' },
    { day: 6, workoutId: null, isRest: true, displayLabel: '—' },
  ])

  // 6× Semana (ímpar)
  await createRotation('6× Semana (ímpar)', 2, [
    { day: 0, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 1, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 2, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 3, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 4, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 5, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 6, workoutId: null, isRest: true, displayLabel: '—' },
  ])

  // 6× Semana (par)
  await createRotation('6× Semana (par)', 3, [
    { day: 0, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 1, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 2, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 3, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 4, workoutId: lowerBody1.id, isRest: false, displayLabel: 'B' },
    { day: 5, workoutId: upperBody1.id, isRest: false, displayLabel: 'A' },
    { day: 6, workoutId: null, isRest: true, displayLabel: '—' },
  ])

  console.log('Weekly rotations created.')

  // ── 9. Create Program Tips ──
  const tips = [
    { icon: '📈', title: 'Progressão de Carga', text: 'Quando completar TODAS as séries no topo da faixa de reps com técnica perfeita, aumente 2,5–5 kg na próxima sessão.' },
    { icon: '📐', title: 'Amplitude Completa', text: 'Nunca sacrifique amplitude por carga. Agachamento abaixo do paralelo, supino tocando o peito, remada com retração escapular total.' },
    { icon: '⏱️', title: 'Controle Excêntrico', text: 'A descida deve durar no mínimo 2 segundos em todos os exercícios. Nunca deixe o peso cair.' },
    { icon: '😴', title: 'Sono', text: '7–9 horas por noite, não negociável. O músculo cresce durante o sono.' },
    { icon: '🥩', title: 'Alimentação', text: '1,6–2g de proteína por kg de peso corporal. Calorias suficientes para suportar o treino.' },
    { icon: '💧', title: 'Hidratação', text: 'Mínimo 2–3 litros de água por dia. Desidratação compromete performance e recuperação.' },
    { icon: '🌬️', title: 'Respiração', text: 'Expire no esforço (subida/empurrão/puxão), inspire no retorno. Nunca prenda a respiração.' },
    { icon: '🩹', title: 'DOMS', text: 'Dor muscular tardia é esperada nas primeiras semanas. Se impedir técnica adequada, adicione dia de descanso extra.' },
  ]

  for (let i = 0; i < tips.length; i++) {
    await prisma.programTip.create({
      data: {
        programId: program.id,
        icon: tips[i].icon,
        title: tips[i].title,
        text: tips[i].text,
        orderIndex: i,
      },
    })
  }

  console.log('Program tips created.')

  // ── 10. Create Program Assignment ──
  await prisma.programAssignment.create({
    data: {
      studentId: studentProfile.id,
      programId: program.id,
      startDate: new Date(),
      isActive: true,
    },
  })

  console.log('Program assignment created.')
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
