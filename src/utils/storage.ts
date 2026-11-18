import { Participant, Prize, DrawRecord, DrawMode, QAModeConfig } from '../types';

const STORAGE_KEYS = {
  PARTICIPANTS: 'lucky_picker_participants',
  PRIZES: 'lucky_picker_prizes',
  RECORDS: 'lucky_picker_records',
  MODE: 'lucky_picker_mode',
  SOUND: 'lucky_picker_sound_enabled',
  QA_CONFIG: 'lucky_picker_qa_config',
};

export const DEFAULT_PRIZES: Prize[] = [
  { id: 'prize-1', name: '特等獎 👑 最新款旗艦手機', count: 1, remaining: 1, color: '#f59e0b', icon: '📱' },
  { id: 'prize-2', name: '頭等獎 🎧 頂級降噪耳機', count: 2, remaining: 2, color: '#ef4444', icon: '🎧' },
  { id: 'prize-3', name: '貳等獎 ⌚ 智慧運動手錶', count: 3, remaining: 3, color: '#8b5cf6', icon: '⌚' },
  { id: 'prize-4', name: '參等獎 💳 千元禮券', count: 5, remaining: 5, color: '#3b82f6', icon: '💳' },
  { id: 'prize-5', name: '幸運獎 🎁 驚喜福袋', count: 10, remaining: 10, color: '#10b981', icon: '🎁' },
];

export const DEFAULT_PARTICIPANTS: Participant[] = Array.from({ length: 30 }, (_, i) => {
  const num = (i + 1).toString().padStart(3, '0');
  return {
    id: `p-${num}`,
    code: num,
    name: `參加者 ${num} 號`,
    weight: 1,
    isWon: false,
  };
});

export function loadParticipants(): Participant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (!raw) return DEFAULT_PARTICIPANTS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PARTICIPANTS;
  }
}

export function saveParticipants(participants: Participant[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  } catch (e) {
    console.error('Failed to save participants', e);
  }
}

export function loadPrizes(): Prize[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (!raw) return DEFAULT_PRIZES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRIZES;
  }
}

export function savePrizes(prizes: Prize[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
  } catch (e) {
    console.error('Failed to save prizes', e);
  }
}

export function loadRecords(): DrawRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecords(records: DrawRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

export const DEFAULT_QA_CONFIG: QAModeConfig = {
  type: 'range',
  rangeStart: 1,
  rangeEnd: 30,
  customInput: '1, 3, 7, 10, 15, 22',
  padDigits: 0,
  prefix: '',
  excludeCalled: true,
  calledCodes: [],
  questionTitle: '第 1 題回答者',
};

export function loadQAConfig(): QAModeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QA_CONFIG);
    if (!raw) return DEFAULT_QA_CONFIG;
    return { ...DEFAULT_QA_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_QA_CONFIG;
  }
}

export function saveQAConfig(config: QAModeConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.QA_CONFIG, JSON.stringify(config));
  } catch {}
}

export function loadDrawMode(): DrawMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODE);
    if (raw === 'prizes' || raw === 'participants' || raw === 'qa') return raw;
    return 'participants';
  } catch {
    return 'participants';
  }
}

export function saveDrawMode(mode: DrawMode) {
  try {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch {}
}

export function loadSoundSetting(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOUND);
    return raw !== 'false';
  } catch {
    return true;
  }
}

export function saveSoundSetting(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(enabled));
  } catch {}
}
