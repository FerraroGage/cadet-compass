<script module lang="ts">
  // Line icons on a 24 grid, drawn for this app. One per idea, used wherever that idea appears.
  const PATHS: Record<string, string> = {
    ranks: 'M4 11l8-5 8 5M4 15l8-5 8 5M4 19l8-5 8 5',
    ribbons: 'M3 8h18v8H3zM8 8v8M11 8v8M13 8v8M16 8v8',
    chain: 'M9 5h6v4H9zM3 16h6v4H3zM15 16h6v4h-6zM12 9v4M6 16v-3h12v3',
    uniform: 'M8 4L3 7l2 4 2-1v10h10V10l2 1 2-4-5-3-4 4z',
    drill: 'M9 4a2.5 2.5 0 0 1 2.500 2.500C11.500 9 10 10 10 12H7c0-2-1-3-1-5.500A2.500 2.500 0 0 1 9 4zM7 14.500h3v.500a1.500 1.500 0 0 1-3 0zM15 8a2.500 2.500 0 0 1 3 2.500c0 2.500-1 3.500-1 5.500h-3c0-2-1-3-1-5 0-1.800.8-3 2-3zM14 18.500h3v.500a1.500 1.500 0 0 1-3 0z',
    knowledge: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.500 1 1.200 1 2.100h5c0-.900.400-1.600 1-2.100A6 6 0 0 0 12 3z',
    regulations: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',
    cards: 'M7 7h13v10H7zM4 14V4h13',
    quiz: 'M4 5h16v11h-8l-5 4v-4H4zM10 8.500a2 2 0 1 1 2 2.500M12 13.200v.1',
    speed: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.500 2M9.500 2.500h5',
    match: 'M4 4h7v7H4zM13 13h7v7h-7zM13 4h7v7h-7zM4 13h7v7H4z',
    order: 'M8 5h12M8 12h12M8 19h12M4 4v2M4 11v2M4 18v2',
    tools: 'M14.700 6.300a4 4 0 0 0-5.400 5.400L3 18l3 3 6.300-6.300a4 4 0 0 0 5.400-5.400l-2.500 2.500-2.500-2.500z',
    metronome: 'M9 3h6l4 18H5zM12 15l5-9M7 15h10',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12v.1',
    sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
    board: 'M4 4h16v11H4zM8 20l4-5 4 5M8 8h8M8 11h5',
    print: 'M7 8V3h10v5M7 17H4V8h16v9h-3M7 14h10v7H7z',
    up: 'M12 20V5M6 11l6-6 6 6',
    coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.500 9.500c-.5-1-1.400-1.500-2.500-1.500-1.500 0-2.500.8-2.500 2s1 1.700 2.500 2 2.500.8 2.500 2-1 2-2.500 2c-1.100 0-2-.5-2.500-1.500M12 6.500V8M12 16v1.500',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    letters: 'M3 18l4-12 4 12M4.500 14h5M14 10h6M17 10v8M14 18h6',
    cut: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.500 7.500L20 18M8.500 16.500L20 6',
    star: 'M12 3l2.700 5.800 6.300.8-4.600 4.400 1.200 6.300L12 17.200 6.400 20.300l1.200-6.300L3 9.600l6.300-.8z',
    pulse: 'M3 12h4l3-8 4 16 3-8h4',
    person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.1',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
    news: 'M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5',
    check: 'M4 12l5 5L20 6',
    pin: 'M12 21c4-5 6-8 6-11a6 6 0 0 0-12 0c0 3 2 6 6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  };
  // What a topic is about, read from its name; anything else takes its module's icon.
  const TOPICS: [RegExp, string][] = [
    [/pay grade/i, 'coin'], [/promotion/i, 'up'], [/history/i, 'clock'], [/glossary|terms/i, 'letters'], [/groom|appearance/i, 'cut'],
    [/general orders|orders of the sentry|commands|precedence|order of/i, 'order'], [/trait|principle|value|creed/i, 'star'],
    [/marksmanship/i, 'target'], [/physical/i, 'pulse'], [/cadence|steps/i, 'metronome'], [/placement|wear/i, 'pin'], [/office holder/i, 'person'],
    [/mission/i, 'target'], [/conduct|criteria|care/i, 'check'],
  ];
  export const topicIcon = (topic: string, module: string) => TOPICS.find(([re]) => re.test(topic))?.[1] ?? module;
</script>

<script lang="ts">
  let { name, size = 22 }: { name: string; size?: number } = $props();
</script>

<svg class="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={PATHS[name] ?? PATHS.info} /></svg>
