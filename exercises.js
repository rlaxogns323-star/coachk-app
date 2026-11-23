/* COACH K — 운동 목록
   kind: weight = 무게×횟수, reps = 횟수만, time = 시간(초), cardio = 시간(분)+거리(km)
   p = 주로 쓰는 근육, s = 도와주는 근육 (근육 이름표는 bodymap.js 참고)
   새 운동은 아래 목록에 한 줄 추가하시면 됩니다. id는 겹치지 않게 영어로 적어 주세요. */
window.COACHK_CATEGORIES = ['가슴', '등', '어깨', '하체', '엉덩이', '팔', '복근', '유산소'];

window.COACHK_EXERCISES = [
  // 가슴
  { id: 'bench_press',        name: '벤치 프레스',             en: 'Bench Press',               cat: '가슴', kind: 'weight', p: ['chest'], s: ['chest_upper', 'delts_front', 'triceps'] },
  { id: 'incline_bench',      name: '인클라인 벤치 프레스',     en: 'Incline Bench Press',       cat: '가슴', kind: 'weight', p: ['chest_upper'], s: ['chest', 'delts_front', 'triceps'] },
  { id: 'db_bench',           name: '덤벨 프레스',             en: 'Dumbbell Press',            cat: '가슴', kind: 'weight', p: ['chest'], s: ['chest_upper', 'delts_front', 'triceps'] },
  { id: 'incline_db',         name: '인클라인 덤벨 프레스',     en: 'Incline Dumbbell Press',    cat: '가슴', kind: 'weight', p: ['chest_upper'], s: ['chest', 'delts_front', 'triceps'] },
  { id: 'chest_press',        name: '체스트 프레스 머신',       en: 'Chest Press Machine',       cat: '가슴', kind: 'weight', p: ['chest'], s: ['delts_front', 'triceps'] },
  { id: 'pec_deck',           name: '펙덱 플라이',             en: 'Pec Deck Fly',              cat: '가슴', kind: 'weight', p: ['chest'], s: ['delts_front'] },
  { id: 'db_fly',             name: '덤벨 플라이',             en: 'Dumbbell Fly',              cat: '가슴', kind: 'weight', p: ['chest'], s: ['chest_upper', 'delts_front'] },
  { id: 'cable_crossover',    name: '케이블 크로스오버',        en: 'Cable Crossover',           cat: '가슴', kind: 'weight', p: ['chest'], s: ['delts_front'] },
  { id: 'push_up',            name: '푸시업',                  en: 'Push-up',                   cat: '가슴', kind: 'reps',   p: ['chest'], s: ['delts_front', 'triceps', 'abs'] },
  { id: 'dips',               name: '딥스',                    en: 'Dips',                      cat: '가슴', kind: 'reps',   p: ['chest', 'triceps'], s: ['delts_front'] },

  // 등
  { id: 'lat_pulldown',       name: '랫 풀다운',               en: 'Lat Pulldown',              cat: '등', kind: 'weight', p: ['lats'], s: ['upper_back', 'biceps', 'delts_rear'] },
  { id: 'pull_up',            name: '풀업',                    en: 'Pull-up',                   cat: '등', kind: 'reps',   p: ['lats'], s: ['upper_back', 'biceps', 'forearms'] },
  { id: 'assist_pull_up',     name: '어시스트 풀업',            en: 'Assisted Pull-up',          cat: '등', kind: 'weight', p: ['lats'], s: ['upper_back', 'biceps'] },
  { id: 'seated_row',         name: '시티드 케이블 로우',       en: 'Seated Cable Row',          cat: '등', kind: 'weight', p: ['upper_back', 'lats'], s: ['delts_rear', 'biceps'] },
  { id: 'barbell_row',        name: '바벨 로우',               en: 'Barbell Row',               cat: '등', kind: 'weight', p: ['upper_back', 'lats'], s: ['delts_rear', 'biceps', 'lower_back'] },
  { id: 'one_arm_row',        name: '원암 덤벨 로우',           en: 'One-arm Dumbbell Row',      cat: '등', kind: 'weight', p: ['lats'], s: ['upper_back', 'delts_rear', 'biceps'] },
  { id: 'tbar_row',           name: '티바 로우',               en: 'T-bar Row',                 cat: '등', kind: 'weight', p: ['upper_back', 'lats'], s: ['delts_rear', 'biceps', 'lower_back'] },
  { id: 'deadlift',           name: '데드리프트',              en: 'Deadlift',                  cat: '등', kind: 'weight', p: ['lower_back', 'glutes', 'hamstrings'], s: ['traps', 'quads', 'forearms', 'lats'] },
  { id: 'back_extension',     name: '백 익스텐션',             en: 'Back Extension',            cat: '등', kind: 'reps',   p: ['lower_back'], s: ['glutes', 'hamstrings'] },
  { id: 'shrug',              name: '슈러그',                  en: 'Shrug',                     cat: '등', kind: 'weight', p: ['traps'], s: ['forearms'] },

  // 어깨
  { id: 'ohp',                name: '오버헤드 프레스',          en: 'Overhead Press',            cat: '어깨', kind: 'weight', p: ['delts_front', 'delts_side'], s: ['triceps', 'traps', 'chest_upper'] },
  { id: 'db_shoulder_press',  name: '덤벨 숄더 프레스',         en: 'Dumbbell Shoulder Press',   cat: '어깨', kind: 'weight', p: ['delts_front', 'delts_side'], s: ['triceps', 'traps'] },
  { id: 'shoulder_press_m',   name: '숄더 프레스 머신',         en: 'Shoulder Press Machine',    cat: '어깨', kind: 'weight', p: ['delts_front', 'delts_side'], s: ['triceps'] },
  { id: 'lateral_raise',      name: '사이드 레터럴 레이즈',     en: 'Lateral Raise',             cat: '어깨', kind: 'weight', p: ['delts_side'], s: ['traps', 'delts_front'] },
  { id: 'front_raise',        name: '프론트 레이즈',            en: 'Front Raise',               cat: '어깨', kind: 'weight', p: ['delts_front'], s: ['chest_upper', 'delts_side'] },
  { id: 'rear_delt_fly',      name: '리어 델트 플라이',         en: 'Rear Delt Fly',             cat: '어깨', kind: 'weight', p: ['delts_rear'], s: ['upper_back', 'traps'] },
  { id: 'face_pull',          name: '페이스 풀',               en: 'Face Pull',                 cat: '어깨', kind: 'weight', p: ['delts_rear'], s: ['upper_back', 'traps'] },
  { id: 'upright_row',        name: '업라이트 로우',            en: 'Upright Row',               cat: '어깨', kind: 'weight', p: ['delts_side', 'traps'], s: ['biceps', 'delts_front'] },

  // 하체
  { id: 'squat',              name: '바벨 스쿼트',             en: 'Barbell Squat',             cat: '하체', kind: 'weight', p: ['quads', 'glutes'], s: ['adductors', 'hamstrings', 'lower_back'] },
  { id: 'goblet_squat',       name: '고블릿 스쿼트',            en: 'Goblet Squat',              cat: '하체', kind: 'weight', p: ['quads', 'glutes'], s: ['adductors', 'abs'] },
  { id: 'hack_squat',         name: '핵 스쿼트',               en: 'Hack Squat',                cat: '하체', kind: 'weight', p: ['quads'], s: ['glutes', 'adductors'] },
  { id: 'smith_squat',        name: '스미스 머신 스쿼트',       en: 'Smith Machine Squat',       cat: '하체', kind: 'weight', p: ['quads', 'glutes'], s: ['adductors', 'hamstrings'] },
  { id: 'leg_press',          name: '레그 프레스',             en: 'Leg Press',                 cat: '하체', kind: 'weight', p: ['quads', 'glutes'], s: ['adductors', 'hamstrings'] },
  { id: 'leg_extension',      name: '레그 익스텐션',            en: 'Leg Extension',             cat: '하체', kind: 'weight', p: ['quads'], s: [] },
  { id: 'leg_curl',           name: '레그 컬',                 en: 'Leg Curl',                  cat: '하체', kind: 'weight', p: ['hamstrings'], s: ['calves'] },
  { id: 'lunge',              name: '런지',                    en: 'Lunge',                     cat: '하체', kind: 'weight', p: ['quads', 'glutes'], s: ['hamstrings', 'adductors', 'calves'] },
  { id: 'bulgarian',          name: '불가리안 스플릿 스쿼트',   en: 'Bulgarian Split Squat',     cat: '하체', kind: 'weight', p: ['quads', 'glutes'], s: ['hamstrings', 'adductors', 'glute_med'] },
  { id: 'rdl',                name: '루마니안 데드리프트',      en: 'Romanian Deadlift',         cat: '하체', kind: 'weight', p: ['hamstrings', 'glutes'], s: ['lower_back', 'forearms'] },
  { id: 'calf_raise',         name: '카프 레이즈',             en: 'Calf Raise',                cat: '하체', kind: 'weight', p: ['calves'], s: [] },

  // 엉덩이
  { id: 'hip_thrust',         name: '힙 쓰러스트',             en: 'Hip Thrust',                cat: '엉덩이', kind: 'weight', p: ['glutes'], s: ['hamstrings', 'glute_med', 'quads'] },
  { id: 'glute_bridge',       name: '글루트 브릿지',            en: 'Glute Bridge',              cat: '엉덩이', kind: 'reps',   p: ['glutes'], s: ['hamstrings', 'abs'] },
  { id: 'monster_glute',      name: '몬스터 글루트 머신',       en: 'Monster Glute Machine',     cat: '엉덩이', kind: 'weight', p: ['glutes'], s: ['hamstrings', 'glute_med'] },
  { id: 'cable_kickback',     name: '케이블 킥백',             en: 'Cable Kickback',            cat: '엉덩이', kind: 'weight', p: ['glutes'], s: ['hamstrings'] },
  { id: 'hip_abduction',      name: '힙 어브덕션',             en: 'Hip Abduction',             cat: '엉덩이', kind: 'weight', p: ['glute_med'], s: ['glutes'] },
  { id: 'hip_adduction',      name: '힙 어덕션',               en: 'Hip Adduction',             cat: '엉덩이', kind: 'weight', p: ['adductors'], s: [] },
  { id: 'clamshell',          name: '클램쉘',                  en: 'Clamshell',                 cat: '엉덩이', kind: 'reps',   p: ['glute_med'], s: ['glutes'] },
  { id: 'sumo_squat',         name: '스모 스쿼트',             en: 'Sumo Squat',                cat: '엉덩이', kind: 'weight', p: ['glutes', 'adductors'], s: ['quads', 'hamstrings'] },

  // 팔
  { id: 'barbell_curl',       name: '바벨 컬',                 en: 'Barbell Curl',              cat: '팔', kind: 'weight', p: ['biceps'], s: ['forearms'] },
  { id: 'db_curl',            name: '덤벨 컬',                 en: 'Dumbbell Curl',             cat: '팔', kind: 'weight', p: ['biceps'], s: ['forearms'] },
  { id: 'hammer_curl',        name: '해머 컬',                 en: 'Hammer Curl',               cat: '팔', kind: 'weight', p: ['biceps', 'forearms'], s: [] },
  { id: 'cable_curl',         name: '케이블 컬',               en: 'Cable Curl',                cat: '팔', kind: 'weight', p: ['biceps'], s: ['forearms'] },
  { id: 'pushdown',           name: '케이블 푸시다운',          en: 'Cable Pushdown',            cat: '팔', kind: 'weight', p: ['triceps'], s: [] },
  { id: 'overhead_ext',       name: '오버헤드 트라이셉스 익스텐션', en: 'Overhead Triceps Extension', cat: '팔', kind: 'weight', p: ['triceps'], s: [] },
  { id: 'lying_ext',          name: '라잉 트라이셉스 익스텐션', en: 'Lying Triceps Extension',   cat: '팔', kind: 'weight', p: ['triceps'], s: [] },
  { id: 'wrist_curl',         name: '리스트 컬',               en: 'Wrist Curl',                cat: '팔', kind: 'weight', p: ['forearms'], s: [] },

  // 복근
  { id: 'crunch',             name: '크런치',                  en: 'Crunch',                    cat: '복근', kind: 'reps',   p: ['abs'], s: ['obliques'] },
  { id: 'cable_crunch',       name: '케이블 크런치',            en: 'Cable Crunch',              cat: '복근', kind: 'weight', p: ['abs'], s: ['obliques'] },
  { id: 'leg_raise',          name: '레그 레이즈',             en: 'Leg Raise',                 cat: '복근', kind: 'reps',   p: ['abs'], s: ['obliques', 'quads'] },
  { id: 'hanging_leg_raise',  name: '행잉 레그 레이즈',         en: 'Hanging Leg Raise',         cat: '복근', kind: 'reps',   p: ['abs'], s: ['obliques', 'forearms'] },
  { id: 'plank',              name: '플랭크',                  en: 'Plank',                     cat: '복근', kind: 'time',   p: ['abs'], s: ['obliques', 'delts_front', 'glutes'] },
  { id: 'side_plank',         name: '사이드 플랭크',            en: 'Side Plank',                cat: '복근', kind: 'time',   p: ['obliques'], s: ['abs', 'glute_med'] },
  { id: 'russian_twist',      name: '러시안 트위스트',          en: 'Russian Twist',             cat: '복근', kind: 'reps',   p: ['obliques'], s: ['abs'] },

  // 유산소
  { id: 'treadmill',          name: '러닝머신',                en: 'Treadmill',                 cat: '유산소', kind: 'cardio', p: ['quads', 'calves'], s: ['hamstrings', 'glutes'] },
  { id: 'cycle',              name: '실내 자전거',             en: 'Indoor Cycle',              cat: '유산소', kind: 'cardio', p: ['quads'], s: ['calves', 'glutes', 'hamstrings'] },
  { id: 'stairmill',          name: '스텝밀(천국의 계단)',      en: 'Stairmill',                 cat: '유산소', kind: 'cardio', p: ['glutes', 'quads'], s: ['calves', 'hamstrings'] },
  { id: 'rowing',             name: '로잉 머신',               en: 'Rowing Machine',            cat: '유산소', kind: 'cardio', p: ['lats', 'quads'], s: ['upper_back', 'biceps', 'hamstrings'] },
  { id: 'elliptical',         name: '일립티컬(마이마운틴)',     en: 'Elliptical',                cat: '유산소', kind: 'cardio', p: ['quads', 'glutes'], s: ['calves', 'hamstrings'] }
];
